# AGENT COORDINATION & DELEGATION PROTOCOL

This protocol defines how the **Principal Software Architect (Orchestrator)** and the specialized engineering team collaborate on the SoulBridge codebase.

---

## 1. Core Orchestration Philosophy

- **Targeted Delegation**: Do NOT invoke every agent for every task. Assign work only to specialists whose domain is directly impacted.
- **Minimal Intervention**: Implement the smallest reliable change that fully satisfies the requirement without unnecessary refactoring.
- **Functional Integrity**: Never break existing working features or replace production code with mocks.
- **Zero-Access Security**: Under no circumstances may any agent read or access environment secret files (`.env*`).

---

## 2. The 8-Step Execution Workflow

```
   [1. Understand Request] 
              │
   [2. Inspect Safely] (Zero .env access)
              │
   [3. Assign Specialist Responsibilities]
              │
   [4. Establish Implementation Plan]
              │
   [5. Implement Targeted Changes]
              │
   [6. Specialist Review]
              │
   [7. Verify & Test]
              │
   [8. Final Report & Handoff]
```

### Step 1: Understand the Request
- Read the user prompt thoroughly.
- Identify the exact problem, business goals, acceptance criteria, technical constraints, and affected subsystems.
- If requirements are ambiguous, clarify before initiating major changes.

### Step 2: Inspect Safely
- Inspect only relevant non-secret project files.
- Apply all exclusion rules: never inspect `.env`, `.env.*`, or credential stores.
- Identify existing conventions, patterns, and component contracts.

### Step 3: Assign Responsibilities
Select the appropriate specialist team based on the task classification matrix:

| Task Type | Primary Specialist | Supporting Specialists | Reviewer |
| :--- | :--- | :--- | :--- |
| **UI/UX & Design** | Senior UI/UX & Graphic Designer | Senior Full-Stack Engineer | Accessibility & Responsive Engineer |
| **Auth & Security** | Senior Full-Stack Engineer | Application Security Engineer | Dating Product & Privacy Specialist |
| **Next.js & Production Build** | Senior Next.js Production Engineer | Senior Full-Stack Engineer | Code Review & Release Engineer |
| **Database & ORM** | Database & Backend Architect | Senior Full-Stack Engineer | Performance & Web Vitals Engineer |
| **Performance & Optimization** | Performance & Web Vitals Engineer | Senior Next.js Production Engineer | QA Automation & Test Engineer |
| **Accessibility / Responsive** | Accessibility & Responsive Engineer | Senior UI/UX Designer | QA Automation & Test Engineer |
| **New Dating Feature** | Principal Software Architect | Full-Stack + UI/UX + Security | QA Automation & Test Engineer |
| **Production Release / Audit** | Code Review & Release Engineer | Principal Architect | Application Security Engineer |

### Step 4: Establish an Implementation Plan
Document a structured plan before writing code:
1. Target files to modify or create.
2. Existing behavior and contracts that must be preserved.
3. Architectural risks, failure scenarios, and dependencies.
4. Testing and verification criteria.
5. User decisions required (if any).

### Step 5: Implement
- Execute the plan with surgical precision.
- Make the smallest reliable, maintainable change.
- Follow Next.js 16 App Router, React 19, Tailwind v4, Prisma MongoDB, and Socket.io patterns.
- Never introduce mocks into production code paths.

### Step 6: Review
- Have the designated domain specialist review the diff:
  - Security review for auth, session, permissions, API endpoints.
  - Architectural review for schema changes, cross-module couplings.
  - Design review for layout, typography, visual hierarchy, mobile responsiveness.

### Step 7: Verify
- Validate the changes:
  - Run linter: `npm run lint`
  - Verify build compatibility: `npm run build`
  - Run database validations: `npx prisma validate`
  - Execute unit/integration tests where applicable.
- Confirm no regressions or broken imports.

### Step 8: Report
Produce a clear, concise implementation report:
- Summary of changes implemented.
- Exact list of files created or modified.
- Tests and verification commands actually executed (with results).
- Any known limitations or technical debt noted.
- Explicit manual steps required by the user (e.g., environment variable settings, external dashboard configuration).

---

## 3. Conflict Resolution and Escalation Rules

1. **Architectural Veto**: The Principal Software Architect has final decision authority on technical design, component hierarchy, and dependency additions.
2. **Security Veto**: The Application Security Engineer may block any PR, change, or deployment that introduces credential leaks, broken access control, or IDOR risks.
3. **Preservation Mandate**: If an implementation breaks existing functionality, the change must be reverted or corrected immediately.
4. **No Delegation of Prohibited Actions**: The orchestrator must never instruct any subagent to perform an action forbidden by project security policies.

