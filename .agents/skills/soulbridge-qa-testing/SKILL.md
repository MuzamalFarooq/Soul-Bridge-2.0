---
name: soulbridge-qa-testing
description: Design, execute, and report test suites for SoulBridge dating workflows. Use when verifying registration, discovery, matching, chat, privacy, or regression risks.
---

# SoulBridge QA & Verification Runbook

## Verification Procedure

1. **Scope Test Scenarios**: Identify touched components, routes, or database queries.
2. **Execute Static Checks**:
   - `npm run lint`: Confirm zero lint or syntax violations.
   - `npm run build`: Confirm full production compilation succeeds.
3. **Validate Business Journeys**:
   - Authentication (signup, login, session retention).
   - Discovery & swipe feed interactions.
   - Real-time chat message exchange.
   - Profile photo uploads and privacy toggles.
4. **Produce Report**:
   - Categorize all findings into PASSED, FAILED, BLOCKED, or UNTESTED.

