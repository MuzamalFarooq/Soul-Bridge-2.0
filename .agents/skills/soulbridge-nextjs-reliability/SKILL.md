---
name: soulbridge-nextjs-reliability
description: Inspect and optimize Next.js 16 and React 19 architecture, Server/Client component boundaries, Turbopack builds, and custom server Socket.io integration. Use when diagnosing build errors, SSR issues, or optimizing production bundles.
---

# SoulBridge Next.js Production Reliability Runbook

## Framework Context
- **Next.js**: 16.2.11 (App Router)
- **React**: 19.2.4
- **Custom Server**: `server.js` running Express/HTTP + Socket.io alongside Next.js

## Procedure

1. **Verify Boundary Directives**:
   - Verify that interactive components declare `'use client'` at the very top.
   - Verify that server-only modules (`prisma`, `nodemailer`, `bcryptjs`) are never imported into client files.
2. **Async Request APIs**:
   - In Next.js 16+, ensure dynamic APIs (`params`, `searchParams`, `cookies()`, `headers()`) are treated as Promises if accessed asynchronously.
3. **Build Validation**:
   - Execute sandboxed verification: `npm run lint` and `npm run build`.
   - Never inspect `.env*` to verify deployment settings.

