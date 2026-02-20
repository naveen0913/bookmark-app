# Smart Bookmark App

## Setup

1. npm install
2. copy .env.example to .env.local
3. add Supabase keys
4. npm run dev

## Supabase SQL

create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamp default now()
);

Enable RLS and policies as described in assignment.

## Deploy
Push to GitHub and import into Vercel.
