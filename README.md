# AluMentor Mentorship Platform

AluMentor is a specialized web platform designed to bridge the gap between university students and alumni mentors. The platform facilitates direct academic advising, booking requests for 1-to-1 advising sessions, and active discussion forums. AluMentor features a centralized control panel for site administrators to manage users, mentors, bookings, and forum posts from a single view.

## Core Features

### Mentorship Management
* Unified directory search for alumni mentors with interactive filtering by availability and expertise.
* Automated booking requests and coordination tools for students and mentors.
* Staggered details views presenting student academic progress and mentor professional backgrounds.

### Academic Forum
* Interactive discussion board supporting markdown posts and comments.
* Pinning and locking of threads by administrators.
* Tagged filter queries to quickly find career advising or academic suggestions.

### Centralized Admin Console
* Custom administrative login bypass for complete system oversight.
* Interactive toggle switches to manage active/suspended account states.
* Direct control options to feature mentors on the landing page, view session details, or delete posts.

## Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Database**: PostgreSQL (Supabase pooled database instance)
* **ORM**: Prisma Client with pg adapter
* **Authentication**: Supabase Auth (Client and Server Session validation)
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion
* **Form Validation**: React Hook Form with Zod

## Folder Structure

```
├── app/                  # Next.js App Router page layouts and route endpoints
│   ├── (public)/         # Publicly accessible routes (Mentors, Forum, Home)
│   ├── admin/            # Centralized Administrator Dashboard
│   ├── dashboard/        # Student and Mentor User Dashboards
│   ├── login/            # Sign In page
│   └── signup/           # User Registration page
├── components/           # Reusable React components
│   ├── admin/            # Administrative dashboard panels and tables
│   ├── dashboard/        # User profile, requests and bookings list
│   ├── forum/            # Discussions list and post editor components
│   ├── layout/           # AppHeader, Sidebar and core layout wrappers
│   └── ui/               # Generic primitive buttons, modals and dialogs
├── lib/                  # Shared business logic and helper functions
│   ├── actions/          # Next.js Server Actions (auth, bookings, forum, user)
│   ├── data/             # Query logic for database fetching
│   ├── db/               # Prisma database client instance
│   ├── supabase/         # Supabase Client and Middleware configurations
│   └── validations/      # Zod validation schemas for form submissions
├── prisma/               # Database definitions and seed workflows
│   ├── schema.prisma     # Main PostgreSQL database schema model
│   └── seed.ts           # Populating students, featured mentors and discussions
└── proxy.ts              # Authentication routing security middleware
```

## Environment Variables

Copy the template configuration file to configure your local variables:

```bash
cp .env.example .env
```

Ensure the following variables are configured in your local environment:

* `DATABASE_URL`: Connection string pointing to the PostgreSQL database (transaction mode pooler, port 6543).
* `DIRECT_URL`: Direct database connection string for migrations (session mode, port 5432).
* `NEXT_PUBLIC_SUPABASE_URL`: Supabase project domain URL.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase project anonymous key.
* `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for administrative operations.
* `NEXT_PUBLIC_APP_URL`: Development environment URL (defaults to http://localhost:3000).
* `NEXT_PUBLIC_DEPLOYED_URL`: Deployed production domain URL for link routing verification.
* `ADMIN_EMAIL`: The static email address required to sign in to the centralized admin panel (defaults to admin@alumentor.com).
* `ADMIN_PASSWORD`: The password required to authenticate the administrator account (defaults to admin123).

## Setup Instructions

### Installation

Clone the repository and install all dependencies:

```bash
npm install
```

### Database Sync

Synchronize the database models with Prisma:

```bash
npx prisma db push
```

### Run Database Seed

Populate the database with mock student, mentor, booking, and forum post records:

```bash
npx prisma db seed
```

### Start Development Server

Run the development server locally:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the application.

## Admin Authentication

Access the administrator console by signing in with the credentials defined under `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment configuration. The authentication system will intercept this account, bypass standard database profiles, and route you directly to the centralized administrator panel at `/admin`.
