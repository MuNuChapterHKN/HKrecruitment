# Agent Guidelines

## Commands

- **Build**: `pnpm build`
- **Dev**: `pnpm dev`
- **Lint**: `pnpm lint`
- **Database**: `pnpm db:push`, `pnpm db:seed`, `pnpm db:reset`
- **No test framework configured** - avoid creating tests unless explicitly requested

## Code Style

- **TypeScript**: Strict mode enabled, use proper typing
- **Imports**: Use `@/` alias for src imports, named imports preferred
- **Components**: Use `export function ComponentName()` syntax
- **Props**: Use intersection types with `React.ComponentProps<"element">`
- **Styling**: TailwindCSS classes, use `cn()` utility for conditional classes
- **Database**: Drizzle ORM with PostgreSQL, use [schema](/src/db/schema.ts) and [types](/src/db/types.ts) constants for enums
- **State**: Use Jotai for state management across components, CASL for permissions
- **Error handling**: Use neverthrow Result pattern where applicable
- **Naming**: camelCase for variables/functions, PascalCase for components/types

## Architecture

- Next.js 15 App Router with React 19
- Component structure: `/components/ui` for reusable, `/components/dashboard` for features
- Database models in `/src/db/schema.ts`, lib utilities in `/src/lib/`
- Use shadcn-ui for components, docs at https://ui.shadcn.com/docs/cli

## Package Manager

Use `pnpm` (version 10.19.0) for all package operations

## Origin Compliance

Before pushing check if the code is following the guidelines specified at `/docs/CONTRIBUTING.md`.
