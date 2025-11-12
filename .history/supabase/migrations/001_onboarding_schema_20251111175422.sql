-- Enable extensions
create extension if not exists pgcrypto;
create extension if not exists postgis;

-- Add geography column to nj_stores for fast radius queries
alter table public.nj_stores
add column if not exists geog geography(Point,4326)
generated always as (
  case
    when "STORE_LATITUDE" is not null and "STORE_LONGITUDE" is not null
    then ST_SetSRID(ST_MakePoint("STORE_LONGITUDE", "STORE_LATITUDE"), 4326)::geography
    else null
  end
) stored;

-- Index for fast spatial queries
create index if not exists nj_stores_geog_gix on public.nj_stores using gist (geog);

-- Onboarding submissions table
create table if not exists public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Step 1: Basics
  store_name text,
  google_place_id text,
  formatted_address text,
  latitude double precision,
  longitude double precision,
  store_type text,
  hours text,
  owner_email text,
  owner_phone text,
  
  -- Step 2: What's working
  whats_selling text,
  products_excited_about text,
  best_time_to_reach text,
  preferred_contact_method text,
  
  -- Metadata
  step_completed integer default 0, -- 0=draft, 1=step1, 2=completed
  session_id text,
  
  -- Computed geography point
  geog geography(Point,4326) generated always as (
    case
      when latitude is not null and longitude is not null
      then ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      else null
    end
  ) stored
);

-- Index for lookups
create index if not exists onboarding_submissions_session_idx on public.onboarding_submissions(session_id);
create index if not exists onboarding_submissions_email_idx on public.onboarding_submissions(owner_email);
create index if not exists onboarding_submissions_created_idx on public.onboarding_submissions(created_at desc);

-- Update timestamp trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger onboarding_submissions_updated_at
  before update on public.onboarding_submissions
  for each row
  execute function public.update_updated_at();

-- RLS policies (optional - enable if adding auth)
-- alter table public.onboarding_submissions enable row level security;

