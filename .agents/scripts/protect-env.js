/**
 * SoulBridge Security Guard Hook
 * Enforces the mandatory zero-access policy for environment secret files (.env, .env.*).
 * Intercepts tool calls (read_file, edit_file, write_file, run_command, etc.)
 * and denies any operation attempting to access or expose protected environment files.
 */

const fs = require('fs');

let rawInput = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  rawInput += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(rawInput || '{}');
    const toolCall = payload.toolCall || {};
    const toolName = (toolCall.name || '').toLowerCase();
    const args = toolCall.args || {};

    // Pattern matching any .env file except .env.example
    const envFileRegex = /(^|[\\/\s"'])(\.env(?!\.example)(\.[a-zA-Z0-9_\-\.]+)?)(["'\s]|$)/i;

    // Pattern matching commands attempting to print environment variables or secrets
    const envDumpRegex = /\b(printenv|Get-ChildItem\s+env:|dir\s+env:|export\s+-p|env\b|set\b(?!\s+[a-zA-Z0-9_]+=))/i;

    let isViolation = false;
    let violationDetail = '';

    // Check all string arguments
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string') {
        if (envFileRegex.test(value)) {
          isViolation = true;
          violationDetail = `Tool argument '${key}' references protected environment file matching '${value}'.`;
          break;
        }

        if (toolName === 'run_command' && envDumpRegex.test(value)) {
          // Check if it's dumping environment variables
          isViolation = true;
          violationDetail = `Command attempts to dump environment variables: '${value}'.`;
          break;
        }
      }
    }

    if (isViolation) {
      const response = {
        decision: 'deny',
        reason: `[SECURITY POLICY VIOLATION] Access to .env files and environment secrets is strictly forbidden on SoulBridge. ${violationDetail} Consult .agents/rules/security-env-policy.md for safe alternatives.`
      };
      process.stdout.write(JSON.stringify(response));
    } else {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
    }
  } catch (err) {
    // On unexpected parse error, default to allow but log to stderr
    process.stderr.write(`[SoulBridge Hook Error]: ${err.message}\n`);
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  }
});

