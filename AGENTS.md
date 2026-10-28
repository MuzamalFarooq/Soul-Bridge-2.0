<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SOULBRIDGE — MULTI-AGENT DEVELOPMENT ENVIRONMENT & PROJECT RULES

> **SYSTEM DIRECTIVE**: This document defines the permanent project-wide rules, security policies, specialized engineering agent roles, and coordination workflows for the SoulBridge dating platform (`https://soulbridge.muzamal.site/`). All AI agents operating in this repository must strictly adhere to these instructions.

---

## 1. MANDATORY SECURITY RULE: NEVER ACCESS ENVIRONMENT FILES

**THIS IS THE HIGHEST-PRIORITY RULE IN THE REPOSITORY. IT SUPERSEDES ALL OTHER TASKS.**

All agents—orchestrator, subagents, terminal runners, and specialist agents—must adhere to this zero-access policy:

### Absolute Restrictions:
- **NEVER** open, read, inspect, search inside, print, or expose `.env`, `.env.local`, `.env.production`, `.env.development`, `.env.test`, or any other environment secret file.
- **NEVER** run commands (`cat`, `type`, `Get-Content`, `grep`, `findstr`, `Select-String`, `dir`, `ls`) targeting environment files.
- **NEVER** execute commands that dump environment variables (e.g., `printenv`, `env`, `set`, `Get-ChildItem env:`).
- **NEVER** use scripts (Node.js, Python, shell) to read or parse environment secret files indirectly.
- **NEVER** include API keys, database connection strings, passwords, or tokens in logs, reports, or messages.
- **NEVER** delegate environment-file inspection to another agent or subagent.
- The prohibition remains active during debugging of authentication, database, email, OAuth, deployment, or API errors.

### Safe Alternatives:
- Inspect source code referencing `process.env.VARIABLE_NAME`.
- Identify required configuration variable names from permitted code, schemas, and `.env.example`.
- Guide the user on manual `.env` configuration without inspecting their actual file.

### Technical Enforcement:
- **PreToolUse Hook**: `.agents/hooks.json` executes `.agents/scripts/protect-env.js` to automatically deny any tool targeting protected `.env*` files.
- **IDE Exclusions**: `.vscode/settings.json` excludes `.env*` from file explorer, search, and file watchers.
- **Git Protection**: `.gitignore` excludes `.env*` from version control.
- Detailed policy: [`.agents/rules/security-env-policy.md`](file:///.agents/rules/security-env-policy.md).

---

## 2. SPECIALIZED ENGINEERING AGENT TEAM

SoulBridge is supported by an 11-member specialized agent team:

1. **Principal Software Architect & Lead**: System design, multi-agent orchestration, technical debt review, architectural vetos. Full role: [`.agents/roles/01-principal-software-architect.md`](file:///.agents/roles/01-principal-software-architect.md).
2. **Senior Full-Stack Software Engineer**: Core feature implementation, Server Actions, API routes, Socket.io, frontend-to-backend integration. Full role: [`.agents/roles/02-senior-fullstack-engineer.md`](file:///.agents/roles/02-senior-fullstack-engineer.md).
3. **Senior UI/UX & Graphic Designer**: Premium aesthetic design system, discovery feed, profile cards, responsive layouts, micro-interactions. Full role: [`.agents/roles/03-senior-ui-ux-designer.md`](file:///.agents/roles/03-senior-ui-ux-designer.md).
4. **Senior Next.js Production Engineer**: Next.js 16.2.11 App Router, React 19, server/client boundary enforcement, Turbopack, custom `server.js` integration. Full role: [`.agents/roles/04-senior-nextjs-production-engineer.md`](file:///.agents/roles/04-senior-nextjs-production-engineer.md).
5. **Application Security Engineer**: Auth & session hardening, IDOR prevention, Zod input validation, private photo/chat protection, abuse prevention. Full role: [`.agents/roles/05-application-security-engineer.md`](file:///.agents/roles/05-application-security-engineer.md).
6. **Database & Backend Architect**: Prisma 6.19 ORM, MongoDB collections, query optimization, indexing, relation integrity, zero data loss. Full role: [`.agents/roles/06-database-backend-architect.md`](file:///.agents/roles/06-database-backend-architect.md).
7. **QA Automation & Test Engineer**: Test plan design, regression verification, flow testing (auth, discovery, swipe, chat), verified reporting. Full role: [`.agents/roles/07-qa-automation-test-engineer.md`](file:///.agents/roles/07-qa-automation-test-engineer.md).
8. **Performance & Web Vitals Engineer**: Core Web Vitals (LCP, INP, CLS), client bundle reduction, image/font delivery, rendering performance. Full role: [`.agents/roles/08-performance-web-vitals-engineer.md`](file:///.agents/roles/08-performance-web-vitals-engineer.md).
9. **Accessibility & Responsive Engineer**: WCAG 2.1 AA compliance, keyboard navigation, focus management, screen readers, touch targets (>=44px), mobile layouts. Full role: [`.agents/roles/09-accessibility-responsive-engineer.md`](file:///.agents/roles/09-accessibility-responsive-engineer.md).
10. **Code Review & Release Engineer**: Line-by-line diff audit, release gates, verification of builds/lints, honest final reporting. Full role: [`.agents/roles/10-code-review-release-engineer.md`](file:///.agents/roles/10-code-review-release-engineer.md).
11. **Dating Platform Product & Privacy Specialist**: Dating user journeys, consent models, anti-harassment/blocking/reporting, mutual match dynamics. Full role: [`.agents/roles/11-dating-product-privacy-specialist.md`](file:///.agents/roles/11-dating-product-privacy-specialist.md).

---

## 3. AGENT COORDINATION PROTOCOL (8-STEP WORKFLOW)

Every task must progress through the structured 8-step workflow:
1. **Understand Request**: Identify the core goal, constraints, and affected subsystems.
2. **Inspect Safely**: Examine only permitted non-secret files. Never inspect `.env*`.
3. **Assign Responsibilities**: Delegate only to relevant specialists using the task matrix in [`.agents/rules/agent-coordination.md`](file:///.agents/rules/agent-coordination.md). Never invoke every agent for every task.
4. **Establish Implementation Plan**: Document files to touch, existing behaviors to preserve, risks, and verification steps.
5. **Implement Surgical Changes**: Make the smallest viable, robust change that satisfies the request.
6. **Domain Specialist Review**: Conduct security, architectural, or design reviews on diffs.
7. **Verify & Test**: Run `npm run lint` and `npm run build` to confirm zero regression.
8. **Final Report**: Detail changes made, files modified, tests run, and manual steps.

---

## 4. PERMANENT DEVELOPMENT STANDARDS

- **Preserve Working Functionality**: SoulBridge is live. Never rewrite working features, delete routes, alter API contracts, or replace production data with mocks.
- **Next.js 16 & React 19 Conventions**: Default to Server Components; use `'use client'` only when necessary. Never leak server packages into client bundles.
- **Custom Server Lifecycle**: Maintain compatibility with `server.js` (Express + Socket.io + Next.js).
- **Database Safety**: Never execute `prisma db push --force-reset` or drop MongoDB collections. Run `npx prisma validate` on schema edits.
- **Dependency Safety**: Do not upgrade major dependencies or add unapproved packages.
- Detailed standards: [`.agents/rules/development-standards.md`](file:///.agents/rules/development-standards.md).
