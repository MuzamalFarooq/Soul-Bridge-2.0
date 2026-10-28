---
name: soulbridge-security-audit
description: Audit SoulBridge code for authentication, authorization, IDOR, input validation, data privacy, and secret protection. Use when reviewing auth flows, API endpoints, user privacy controls, or security vulnerabilities.
---

# SoulBridge Security & Privacy Audit Runbook

## Security Verification Checklist

1. **Environment File Protection**: Verify no tool or command accesses `.env*` or logs process secrets.
2. **Session Verification**: Ensure `getServerSession(authOptions)` is verified on every Server Action and `/api/*` route handler.
3. **IDOR Check**: Verify that queries querying user data explicitly check `userId: session.user.id` or relationship permissions.
4. **Data Minimization**: Verify that queries exclude `passwordHash` and private contact details from public profile views.
5. **Input Validation**: Check that all request inputs are validated through Zod schemas before database persistence.
6. **Chat & Media Isolation**: Ensure private messages and private photos (`isPrivate: true`) require mutual match authorization.

