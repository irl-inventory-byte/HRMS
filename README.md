# HRMS

Employee HRMS dashboard — Next.js (TypeScript, App Router) + Supabase.

## Features
- Employee directory
- Exit form (filed by manager)
- Internal transfer / role-change form, with contract → full-time conversion
- Job openings + applications, with automatic rejection of duplicate applications
- Interview tracking, with a warning when a candidate has been rejected more than once
- Walk-in interview queue, checking each candidate's application/interview history
- Role-based access (Admin, HR, Manager, Interviewer, Employee) enforced via Supabase RLS

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor (tables, triggers, RLS policies).
3. Copy `.env.example` to `.env.local` and fill in your Supabase URL/keys.
4. For each user, add a row to `profiles` with their `role`.
5. `npm install`
6. `npm run dev`

## Deployment
Deploy via Vercel, same as the inventory-app (inventorydb) setup — connect this repo and set the same env vars in the Vercel project settings.
