import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

// Tests must never hit the real backend. Vitest loads .env(.local), so without
// this the store's getRepository() would pick the Supabase implementation and
// writes from tests (adding stops, events, etc.) would land in the live database.
// Force the in-memory repository before every test; suites that need a specific
// repo (e.g. repository.test.ts) override this in their own beforeEach.
//
// The import is dynamic (not top-level) so this setup file doesn't eagerly
// evaluate supabaseRepository.ts — supabaseRepository.test.ts mocks
// '@supabase/supabase-js', and that mock must register before the module loads.
beforeEach(async () => {
  const { setRepository, InMemoryRepository } = await import('../store/repository')
  setRepository(new InMemoryRepository())
})
