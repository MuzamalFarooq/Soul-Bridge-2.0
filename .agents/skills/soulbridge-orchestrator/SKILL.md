---
name: soulbridge-orchestrator
description: Coordinate SoulBridge development tasks across specialized AI agents. Use when planning features, triaging bugs, delegating tasks to specialists, or reviewing system-wide architectural changes.
---

# SoulBridge Multi-Agent Orchestrator

This runbook guides the Principal Software Architect in coordinating tasks across the SoulBridge engineering agent team.

## Workflow

1. **Classify Request**: Determine task domain (UI/UX, Full-Stack, Next.js, Security, Database, Performance, Accessibility, QA, Release).
2. **Review File Exclusions**: Confirm `.agents/rules/security-env-policy.md` applies. Never permit tasks targeting `.env*`.
3. **Select Minimum Team**: Reference the delegation matrix in `.agents/rules/agent-coordination.md`.
4. **Draft Architecture Plan**: Detail affected files, contracts to preserve, risks, and verification strategy.
5. **Execute with Specialists**: Delegate domain tasks to the chosen specialist(s).
6. **Enforce Review Gate**: Have the Code Review and Release Engineer or Security Engineer audit diffs.
7. **Final Verification**: Run `npm run lint` and `npm run build` to verify zero regression.

