create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists engagements (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references profiles(id) on delete set null,
  client_name text not null,
  objective text,
  plan_json jsonb,
  research_brief_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  staff_name text not null,
  staff_role text,
  pin text not null,
  status text not null default 'pending',
  eleven_conversation_id text,
  call_started_at timestamptz,
  call_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transcripts (
  id uuid primary key default gen_random_uuid(),
  interview_session_id uuid unique not null references interview_sessions(id) on delete cascade,
  transcript_text text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists extractions (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid unique not null references engagements(id) on delete cascade,
  work_map_json jsonb,
  impact_json jsonb,
  opportunities_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outputs (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  type text not null,
  version int not null default 1,
  status text not null default 'draft',
  content_md text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
