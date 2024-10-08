# Supabase + SvelteKit User Auth Template

Supabase docs are a bit confusing and some outdated, so this is a template if you are only interested in setting up Social Auth with Sveltekit.

- Can read/update per-user settings and notes, part extraced from https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/server-side/sveltekit.mdx
- This repo is a modified version of https://github.com/supabase/supabase/tree/master/examples/user-management/sveltekit-user-management 
- SQL code below has been updated and tested

___

## Build from scratch

### 1. Create new project

Sign up to Supabase - [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a new project. Wait for your database to start.

### 2. Run "User Management" Quickstart

Once your database has started, head over to your project's `SQL Editor` and run the "User Management Starter" quickstart. On the `SQL editor` page, scroll down until you see `User Management Starter: Sets up a public Profiles table which you can access with your API`. Click that, then click `RUN` to execute that query and create a new `profiles` table. When that's finished, head over to the `Table Editor` and see your new `profiles` table.

### 3. Get the URL and Key

Go to the Project Settings (the cog icon), open the API tab, and find your API URL and `anon` key, you'll need these in the next step.

The `anon` key is your client-side API key. It allows "anonymous access" to your database, until the user has logged in. Once they have logged in, the keys will switch to the user's own login token. This enables row level security for your data. Read more about this [below](#postgres-row-level-security).

![image](https://user-images.githubusercontent.com/10214025/88916245-528c2680-d298-11ea-8a71-708f93e1ce4f.png)

**_NOTE_**: The `service_role` key has full access to your data, bypassing any security policies. These keys have to be kept secret and are meant to be used in server environments and never on a client or browser.

### 4. Env vars

Create `.env.local` from the `.env.example` file and populate this file with your URL and Key.

### 5. Run the application

Run the application: `npm run dev`. Open your browser to `https://localhost:5173/` and you are ready to go 🚀.

## Supabase details

### Postgres Row level security

This project uses very high-level Authorization using Postgres' Row Level Security.
When you start a Postgres database on Supabase, we populate it with an `auth` schema, and some helper functions.
When a user logs in, they are issued a JWT with the role `authenticated` and their UUID.
We can use these details to provide fine-grained control over what each user can and cannot do.

This is a trimmed-down schema, with the policies:

```sql
-- Create a table for Public Profiles
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  website text,
  primary key (id),
  unique(username),
  constraint username_length_min check (char_length(username) >= 3),
  constraint username_length_max check (char_length(username) <= 12)
);
-- Profile permissions
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( (select auth.uid()) = id );
create policy "Users can update own profile."
  on profiles for update
  using ( (select auth.uid()) = id );
-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;
-- Create db function to handle new users. 
-- TODO: add name automatically as well
drop function if exists handle_new_user cascade;
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;
-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create table for personal notes
create table notes (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  note text not null
);

alter table notes enable row level security;

revoke all on table notes from authenticated;
revoke all on table notes from anon;

grant all (note) on table notes to authenticated;
grant select (id) on table notes to authenticated;
grant delete on table notes to authenticated;

create policy "Users can access and modify their own notes"
on notes
for all
to authenticated
using ((select auth.uid()) = user_id);

```

## Authors

- [Supabase](https://supabase.com)

Supabase is open source. We'd love for you to follow along and get involved at https://github.com/supabase/supabase