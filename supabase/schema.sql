-- BRIDGE schema. Run once in the Supabase SQL editor.
-- Columns are quoted camelCase so PostgREST rows map directly to the TS domain
-- types (src/store/types.ts) with no translation layer.
-- RLS is left OFF for the demo (throwaway prototype, anon-key access). Do not
-- ship this to production without policies.

create table if not exists applications (
  id text primary key,
  "founderId" text,
  "founderName" text,
  "founderInitials" text,
  "companyName" text,
  technology text,
  stage text,
  "submittedAt" text,
  "daysInProcess" integer,
  "ownerId" text,
  "signalDeadline" text,
  notes text,
  funding text,
  "teamSize" integer
);

create table if not exists owners (
  id text primary key,
  name text,
  initials text,
  role text,
  department text,
  implementations integer,
  "startupsOwned" integer,
  "avgDaysToSignal" integer,
  "connectionsThisQuarter" integer
);

create table if not exists pain_point_clusters (
  id text primary key,
  label text,
  summary text,
  "painPointIds" jsonb default '[]'::jsonb
);

create table if not exists pain_points (
  id text primary key,
  title text,
  description text,
  "submittedBy" text,
  department text,
  status text,
  "linkedApplicationId" text,
  "submittedAt" text,
  "clusterId" text references pain_point_clusters(id) on delete set null
);

create table if not exists pool_members (
  id text primary key,
  name text,
  company text,
  type text,
  "techArea" text,
  "addedAt" text,
  "addedByName" text,
  "applicationId" text,
  notes text
);

create table if not exists community_events (
  id text primary key,
  title text,
  date text,
  location text,
  description text,
  type text,
  "invitedMemberIds" jsonb default '[]'::jsonb
);

create table if not exists system_metrics (
  id integer primary key,
  "activePilots" integer,
  implementations integer,
  "avgTimeToSignal" numeric,
  "targetTimeToSignal" numeric,
  "connectionsThisQuarter" integer,
  "implementationsThisQuarter" integer
);

-- Grant the anon/authenticated roles access (RLS off for the demo).
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
