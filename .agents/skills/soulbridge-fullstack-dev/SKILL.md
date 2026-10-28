---
name: soulbridge-fullstack-dev
description: Implement fullstack features for SoulBridge, covering Next.js App Router, React 19 UI, Prisma MongoDB operations, and Socket.io events. Use when adding or modifying user-facing features, forms, or APIs.
---

# SoulBridge Fullstack Feature Development Runbook

## Development Procedure

1. **Inspect Existing Contracts**:
   - Check related models in `prisma/schema.prisma`.
   - Check existing API routes in `src/app/api/` or Server Actions in `src/actions/`.
   - Check relevant context providers in `src/context/`.
2. **Implement Backend First**:
   - Define Zod schema for input validation.
   - Implement route handler or Server Action with error handling.
3. **Implement Frontend UI**:
   - Build accessible, responsive UI with Tailwind v4.
   - Wire up React 19 actions, state transitions, and loading states.
4. **Wire Real-Time Events (if applicable)**:
   - Connect to `useSocket` from `src/context/SocketContext.js`.
   - Register and cleanup listeners in `useEffect`.
5. **Verify Without Breaking Existing Logic**:
   - Test happy path, validation errors, and empty states.

