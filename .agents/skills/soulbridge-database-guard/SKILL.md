---
name: soulbridge-database-guard
description: Safely inspect, optimize, and evolve Prisma MongoDB schema and queries for SoulBridge. Use when adding models, designing indexes, preventing N+1 queries, or handling data migrations safely.
---

# SoulBridge Database & Prisma Guard Runbook

## Core Rules

1. **Zero Destructive Actions**: Never run `prisma db push --force-reset` or drop database collections.
2. **MongoDB Conventions**: Use `@db.ObjectId` for all foreign keys and MongoDB `_id` mappings.
3. **Index Strategy**: Define `@index` or `@@index` on high-frequency query fields (e.g. `userId`, `swiperId`, `swipedId`, `createdAt`).
4. **Validation**: Run `npx prisma validate` to confirm schema validity before committing changes.
5. **Client Generation**: Run `npx prisma generate` after approved schema modifications.

