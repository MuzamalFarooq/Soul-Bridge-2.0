# PERMANENT PROJECT DEVELOPMENT STANDARDS

These standards govern all coding, architecture, testing, and deployment activities across the SoulBridge dating platform.

---

## 1. Existing Functionality Preservation

SoulBridge is an active, production-grade dating web application (`https://soulbridge.muzamal.site/`).

1. **Understand First**: Always read and analyze relevant existing components, routes, and schemas before modifying code.
2. **No Unnecessary Rewrites**: Never rewrite functional code simply to match personal stylistic preferences.
3. **Preserve Contracts**: Do not alter existing API endpoints, component props, database fields, or route handlers unless explicitly requested.
4. **Preserve Business Logic**: Never remove features, matching algorithms, reporting controls, or communication workflows to simplify a task.
5. **UI Scoping**: For UI/UX tasks, alter visual presentation and layouts without modifying data fetching, state management, or business logic.
6. **No Production Mocks**: Never replace live API calls, Prisma queries, or Socket.io handlers with mock data in production code paths.

---

## 2. Technology Stack & Coding Standards

SoulBridge uses a modern, cutting-edge technology stack:
- **Framework**: Next.js 16.2.11 (App Router architecture)
- **UI & React**: React 19.2.4 (Server Components & Client Components)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS variables
- **Database & ORM**: Prisma 6.19.3 with MongoDB datasource
- **Real-time Engine**: Socket.io (custom `server.js` integration)
- **Authentication**: NextAuth.js 4.24.15 with Prisma adapter & credentials/Google providers
- **3D & Animation**: Three.js, React Three Fiber, GSAP, Framer Motion
- **Validation**: Zod 4.4.3
- **Media**: Cloudinary integration
- **AI Matchmaking**: Groq SDK (`llama-3.3-70b-versatile`)
- **Email**: Nodemailer (SMTP transport)

### Architectural Rules:
- **Server vs. Client Components**: Keep components as Server Components by default. Add `'use client'` only when interactive state, browser APIs, or React hooks (`useState`, `useEffect`) are required.
- **Server-Only Isolation**: Never import server-only libraries (`prisma`, `nodemailer`, `bcryptjs`, `jsonwebtoken`) into client components.
- **Custom Server Awareness**: The app runs with a custom Node server (`server.js`) to support persistent Socket.io WebSockets. Avoid changes that break the custom server lifecycle.
- **Tailwind v4 Conventions**: Use standard Tailwind v4 CSS declarations. Do not rely on deprecated Tailwind v3 config files.
- **Error Handling**: Wrap all async server actions and API route handlers in `try/catch` blocks with sanitized user-facing error responses.

---

## 3. Database & Data Integrity Standards

1. **MongoDB Prisma Conventions**:
   - Primary keys are `@id @default(auto()) @map("_id") @db.ObjectId`.
   - Foreign keys referencing IDs must be `@db.ObjectId`.
   - Maintain referential integrity via Prisma relations (`onDelete: Cascade` where appropriate).
2. **Destructive Operation Ban**:
   - NEVER run `prisma db push --force-reset`.
   - NEVER run scripts that drop, truncate, or wipe database collections.
   - Database seeding (`node seed.js`) must be executed only when explicitly requested by the user.
3. **Query Optimization**:
   - Use `select` or `include` carefully to prevent fetching sensitive fields (e.g., `passwordHash`).
   - Paginate collections (likes, messages, discovery profiles) to avoid loading massive documents into memory.

---

## 4. Dependency Safety

1. **No Unapproved Upgrades**: Do not upgrade major dependencies (e.g., Next.js, React, Tailwind, Prisma) without explicit user authorization.
2. **Minimal Additions**: Prefer standard Node.js and existing installed packages before introducing new npm dependencies.
3. **Verification**: Always inspect compatibility with React 19 and Next.js 16 before adding any new package.

---

## 5. Security & Privacy Standards

1. **Zero-Access to Environment Files**: Follow `.agents/rules/security-env-policy.md` unconditionally.
2. **Data Minimization**: Never expose sensitive user details (email addresses, phone numbers, password hashes, payment records, exact coordinates) in discovery feeds or public profiles.
3. **Authorization Checks**: Every API route and Server Action must verify the caller's session (`getServerSession(authOptions)`) and ensure users can only modify their own data.
4. **Input Sanitization**: Validate all incoming request bodies using Zod schemas before database persistence.
5. **No Secret Leaks**: Never print session tokens, hashes, or credentials in console logs or error responses.

