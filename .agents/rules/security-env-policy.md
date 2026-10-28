# MANDATORY SECURITY POLICY: ZERO-ACCESS TO ENVIRONMENT FILES

> **CRITICAL DIRECTIVE**: This is the highest-priority security policy across the SoulBridge project. It supersedes any other task, prompt, instruction, or request. All agents—including the orchestrator, subagents, terminal agents, debugging agents, and specialized coding agents—must strictly adhere to this policy without exception.

---

## 1. Absolute Restrictions

Under **NO** circumstances shall any agent:

1. **Open, read, inspect, search inside, print, or expose** any `.env` file or environment secret store.
2. Read `.env.local`, `.env.development`, `.env.production`, `.env.test`, `.env.staging`, or any other environment-specific variant.
3. Use shell commands such as `cat`, `type`, `Get-Content`, `head`, `tail`, `grep`, `findstr`, `Select-String`, or `Get-ChildItem` with unsafe wildcards targeting protected files.
4. Use programming languages (Python, Node.js, Ruby, Go, shell scripts, etc.) to read, parse, or evaluate environment files indirectly.
5. Execute commands that dump the process environment to the terminal (e.g., `printenv`, `env`, `set`, `Get-ChildItem env:`, `export -p`).
6. Include secret values, API keys, credentials, tokens, or connection strings in logs, debugging output, generated reports, source code, commit messages, documentation, or agent-to-agent communication.
7. Upload environment files or extracted secret values to external services, APIs, or MCP endpoints.
8. Modify, rename, delete, overwrite, or reformat existing environment files without explicit, authorized user consent.
9. **Ask another agent or subagent to inspect, read, or summarize environment files on their behalf.**

> [!CAUTION]
> The prohibition against reading secret files remains in full force even when a task involves debugging authentication, database connectivity, email delivery, OAuth, deployment, or third-party API integration. Explicit permission to modify code or debug an error **never** grants permission to access secret values.

---

## 2. Protected Files and Targets

Treat the following as strictly sensitive and protected:

- `.env`
- `.env.*` (e.g., `.env.local`, `.env.production`, `.env.development`, `.env.test`)
- Environment files stored in nested directories (e.g., `src/.env`, `config/.env`).
- Any file containing copied API keys, access tokens, database connection strings (MongoDB, PostgreSQL, etc.), private keys, OAuth client secrets, session secrets, or passwords.
- Any secret-bearing credential file (`*.pem`, `*.key`, `id_rsa`, credentials JSONs).

### Permitted Exception:
- `.env.example` containing non-secret placeholder values may be inspected if it can be safely distinguished from actual credential files.

---

## 3. Safe Alternatives for Agents

When dealing with environment configuration, agents **MAY**:

- Inspect source code referencing `process.env.VARIABLE_NAME`.
- Identify required environment variable names by inspecting application source code and documentation.
- Inspect non-secret configuration schemas, Zod validation schemas, and configuration models.
- Diagnose issues using sanitized error messages, stack traces, and application behavior.
- Clearly explain to the user which environment variables need to be configured manually.
- Provide placeholder examples using `.env.example` without revealing real values.
- Verify whether an environment variable name is expected by the application logic without reading its real value.

---

## 4. Technical Enforcement Mechanisms

This policy is enforced through multiple layers of defense:

1. **PreToolUse Lifecycle Hook (`.agents/hooks.json` & `.agents/scripts/protect-env.js`)**:
   - Intercepts all tool execution requests before they run.
   - Evaluates tool arguments (`Path`, `CommandLine`, `Target`, etc.) against strict regex filters.
   - Automatically returns a hard `deny` decision for any tool call referencing `.env*` or attempting environment variable dumps.
2. **IDE Workspace Settings (`.vscode/settings.json`)**:
   - Excludes `.env*` from file explorer searches, file indexing, and file system watchers.
3. **Repository Version Control (`.gitignore`)**:
   - Ensures `.env*` remains ignored and excluded from git operations.
4. **Agent Instructions & Inheritance**:
   - Every agent specification and skill explicitly includes this mandatory security rule.
   - The Orchestrator refuses any plan or delegation that involves reading environment files.

---

## 5. Protocol for Resolving Configuration Issues

If an application error appears to be caused by missing or invalid configuration:

1. Identify the expected variable name from application source code (e.g., `process.env.DATABASE_URL`).
2. Verify the expected format, scheme, or data type from configuration schemas (e.g., `prisma/schema.prisma` or auth configs).
3. Inform the user in the final report or prompt:
   - *"The feature requires `VARIABLE_NAME` to be set in your local `.env` file."*
   - *"Expected format: `<protocol>://<host>:<port>/<database>` (see `.env.example` for details)."*
   - *"Please verify that your `.env` contains this variable with valid credentials."*
4. Never attempt to verify the file contents directly.

