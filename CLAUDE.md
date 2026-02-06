# CLAUDE.md — Trading Analysis Platform

## Project Overview

Stock trading analysis and portfolio management app built with:

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts, Lightweight Charts
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **Data:** Yahoo Finance, Reddit scraping, news scraping, sentiment analysis, technical indicators
- **Infra:** Node-cron for scheduled jobs, custom server.ts entry point

## Autonomy Directive

You operate with **full autonomy** on this project. You are expected to:

- Make decisions independently — do not ask for permission on routine actions (file edits, package installs, builds, tests, git operations, refactoring)
- Act first, report after — execute tasks fully before summarizing what you did
- Take initiative — if you see something broken, fix it; if something is missing, add it
- Chain actions — don't stop after one step when the task requires multiple steps
- Handle errors yourself — when something fails, diagnose, fix, and retry before asking for help

## Skill Management

- **Discover skills proactively:** When a task could benefit from a specialized skill, use `/find-skills` to search for one
- **Install skills** when they match your needs — don't hesitate
- **Create custom skills** when no existing skill covers a recurring task pattern. Save them to `.claude/skills/` with clear descriptions so they can be reused
- Use existing skills like `next-best-practices`, `vercel-react-best-practices`, `better-auth-best-practices`, `next-cache-components` when relevant

## Subagents & Teammates

Spin up Task agents aggressively to parallelize work:

- **Explore agents** — for codebase research, finding patterns, understanding dependencies
- **Bash agents** — for running builds, tests, linters, database operations in background
- **Plan agents** — for designing architecture and implementation strategies
- **General-purpose agents** — for complex multi-step research tasks

Treat subagents as teammates. Delegate work to them to keep the main context focused. Launch multiple agents in parallel whenever their tasks are independent.

## MCP Servers

When a task requires persistent external tool access (database queries, API integrations, third-party services), proactively set up MCP servers:

- Configure them in `.claude/mcp.json` or the project settings
- Use MCP tools for database inspection, API exploration, and service integration
- Prefer MCP over manual CLI commands for repeated interactions with external services

## Memory & Learning

- **Always consult** `/Users/thief/.claude/projects/-Users-thief-projets-trading-test/memory/MEMORY.md` before starting work
- **Record learnings** after completing meaningful tasks — patterns, gotchas, strategies that worked
- **Create topic files** (e.g., `debugging.md`, `database.md`, `api-patterns.md`) for detailed notes
- **Update or remove** outdated memories
- Learn from mistakes — if something goes wrong, write it down so it doesn't happen again

## Project Conventions

### Key Paths

- `src/app/` — Next.js pages and API routes
- `src/components/` — React components (charts, dashboard, layout, news, reddit, ui)
- `src/lib/` — Business logic (API clients, analysis, cron, utilities)
- `src/types/` — TypeScript type definitions
- `prisma/schema.prisma` — Database schema
- `scripts/` — Data fetching and analysis scripts
- `server.ts` — Custom server with cron initialization

### Common Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run dev:cron` — Run cron jobs separately
- `npm run build` — Production build
- `npm run lint` — ESLint checks
- `npm run db:push` — Push schema to database
- `npm run db:generate` — Regenerate Prisma client
- `npm run db:seed` — Seed database

### Path Alias

- `@/*` maps to `./src/*`

### Component Library

- Using shadcn/ui (New York style) — add components via `npx shadcn@latest add <component>`

### Database

- PostgreSQL via Prisma
- Models: Stock, StockPrice, Signal, SentimentData, NewsArticle, RedditTrending, Portfolio
- Prisma client generated to `src/generated/prisma/`

### Coding Patterns

- Server Components by default, `"use client"` only when needed
- API routes in `src/app/api/` following Next.js conventions
- Shared Prisma client from `src/lib/db.ts`
- Technical indicators computed in `src/lib/analysis/indicators.ts`
- Signal generation in `src/lib/analysis/signal-generator.ts`
