import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Apply from '../routes/Apply'

// ── Mocks ─────────────────────────────────────────────────────────────────────
let ioCallback: IntersectionObserverCallback = () => {}

beforeEach(() => {
  ioCallback = () => {}
  class MockIO {
    constructor(cb: IntersectionObserverCallback) { ioCallback = cb }
    observe = vi.fn()
    disconnect = vi.fn()
  }
  vi.stubGlobal('IntersectionObserver', MockIO)
  // jsdom doesn't implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

function renderApply() {
  return render(
    <MemoryRouter>
      <Apply />
    </MemoryRouter>,
  )
}

function revealElement(el: Element) {
  act(() => {
    ioCallback(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
  })
}

/** The <section> containing the TRL buttons — unique to §02. */
function getS2Section() {
  return screen.getByRole('heading', { name: /where you are/i }).closest('section')!
}

async function fillSection01(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('Your startup name'), 'Acme')
  await user.type(screen.getByPlaceholderText('Jonas Weber'), 'Jan Müller')
  await user.selectOptions(screen.getByDisplayValue('Select region…'), 'Hesse')
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Apply — Where you are (§02) reveal persistence', () => {
  it('keeps the in class when a submit attempt adds the error ring', async () => {
    // The bug: React reconciles the className prop from 'ap-reveal' →
    // 'ap-reveal ap-error-ring' on submit, overwriting the DOM and dropping
    // the 'in' class that the IntersectionObserver added imperatively.
    const user = userEvent.setup()
    renderApply()

    await fillSection01(user)

    const s2 = getS2Section()
    revealElement(s2)
    expect(s2.classList.contains('in')).toBe(true)

    // Submit with §02 empty: attempted → true, s2Done = false
    // className prop changes → React rewrites the DOM attribute → 'in' is lost
    await user.click(screen.getByRole('button', { name: /submit application/i }))

    expect(s2.classList.contains('in')).toBe(true) // RED before fix
  })

  it('shows the error ring on §02 when submit is attempted with §01 done but §02 empty', async () => {
    const user = userEvent.setup()
    renderApply()

    const s2 = getS2Section()
    revealElement(s2)

    await fillSection01(user)
    await user.click(screen.getByRole('button', { name: /submit application/i }))

    expect(s2.classList.contains('ap-error-ring')).toBe(true)
  })

  it('clears the error ring once TRL and MVP are both filled', async () => {
    const user = userEvent.setup()
    renderApply()

    const s2 = getS2Section()
    revealElement(s2)

    await fillSection01(user)
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    expect(s2.classList.contains('ap-error-ring')).toBe(true)

    // New simplified TRL: 4 labelled buttons instead of T1–T9
    await user.click(within(s2).getByRole('button', { name: /prototype/i }))
    // New MVP yes/no toggle instead of Current Stage combobox
    await user.click(within(s2).getByRole('button', { name: /yes.*mvp/i }))

    expect(s2.classList.contains('ap-error-ring')).toBe(false)
  })
})
