<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AlumniConnect Developer Rules

## CRITICAL: Visual UI Reference Images
- **Before creating any page, you MUST ask the user for a reference image.** The user has specific design images for each page. Do not assume or generate UI layouts without checking if a design reference is available.

## Coding & Architectural Conventions
- **Framework**: Next.js App Router (`src/app` structure).
- **TypeScript**: Strictly type-safe code. Avoid `any`.
- **Database**: Prisma ORM for schema and data mutations, connecting to Supabase Postgres.
- **Authentication**: Supabase Auth (email/password).
- **Styling**: Tailwind CSS + shadcn/ui.
- **Forms**: React Hook Form with Zod schema validation.
- **Folder Structure**: Follow the organization defined in [prd.md](file:///d:/Projects/alumcon/prd.md).
