---
name: soulbridge-code-review
description: Execute structured code reviews, git diff audits, and release safety checks for SoulBridge. Use before merging pull requests, completing major tasks, or deploying releases.
---

# SoulBridge Code Review & Release Runbook

## Review Checklist

1. **Security Audit**:
   - Zero `.env*` files modified or touched.
   - Zero hardcoded credentials, API keys, or private tokens.
2. **Quality Audit**:
   - Smallest appropriate diff that satisfies the task.
   - No commented-out code chunks or rogue `console.log` statements.
   - Existing component contracts and APIs preserved.
3. **Build & Test Verification**:
   - `npm run lint` passes cleanly.
   - `npm run build` succeeds without errors.
4. **Sign-off**:
   - Produce a concise final report summarizing changes, verified commands, and manual requirements.

