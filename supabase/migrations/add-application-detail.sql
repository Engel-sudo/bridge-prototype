-- Adds the full application-detail columns to an existing `applications` table.
-- Run once in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS).

alter table applications add column if not exists "region" text;
alter table applications add column if not exists "wantsVisit" boolean;
alter table applications add column if not exists "teamMembers" text;
alter table applications add column if not exists "website" text;
alter table applications add column if not exists "linkedin" text;
alter table applications add column if not exists "formerProjects" text;
alter table applications add column if not exists "targetDepartment" text;
alter table applications add column if not exists "productStage" text;
alter table applications add column if not exists "trl" integer;
alter table applications add column if not exists "milestones" text;
alter table applications add column if not exists "monthsToMarket" text;
alter table applications add column if not exists "deployment" jsonb default '[]'::jsonb;
alter table applications add column if not exists "connectsTo" text;
alter table applications add column if not exists "complianceCert" text;
alter table applications add column if not exists "partnerType" text;
alter table applications add column if not exists "timeline" text;
