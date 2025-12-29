/**
 * Startup validation and error messages
 * Checks for common configuration issues and missing dependencies
 */

export interface StartupError {
  code: string
  message: string
  solution: string
}

export const STARTUP_ERRORS: Record<string, StartupError> = {
  MISSING_SHARP: {
    code: 'MISSING_SHARP',
    message: 'Sharp image processing library is not available',
    solution: 'Run: npm install sharp',
  },
  MISSING_CANVAS: {
    code: 'MISSING_CANVAS',
    message: 'Canvas library is not available',
    solution: 'Run: npm install canvas',
  },
  INVALID_CONFIG: {
    code: 'INVALID_CONFIG',
    message: 'Invalid Next.js configuration detected',
    solution: 'Check next.config.js for syntax errors',
  },
  PORT_IN_USE: {
    code: 'PORT_IN_USE',
    message: 'Port 3000 is already in use',
    solution: 'Kill the process using port 3000 or set PORT environment variable',
  },
  BUILD_FAILED: {
    code: 'BUILD_FAILED',
    message: 'Next.js build failed',
    solution: 'Check build logs for TypeScript or dependency errors',
  },
  API_ROUTES_STATIC_EXPORT: {
    code: 'API_ROUTES_STATIC_EXPORT',
    message: 'Cannot use API routes with static export (output: "export")',
    solution: 'Remove API routes or use a platform that supports serverless functions (e.g., Vercel)',
  },
  MISSING_ENV_VARS: {
    code: 'MISSING_ENV_VARS',
    message: 'Required environment variables are missing',
    solution: 'Create a .env.local file with required variables',
  },
}

export function formatStartupError(error: StartupError): string {
  return `
❌ Startup Failed: ${error.code}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${error.message}

💡 Solution:
   ${error.solution}

📚 For more help, check:
   - TROUBLESHOOTING.md
   - Next.js documentation: https://nextjs.org/docs
`
}

export function checkStartupRequirements(): { valid: boolean; errors: StartupError[] } {
  const errors: StartupError[] = []

  // Check if we're trying to use static export with API routes
  if (process.env.GITHUB_PAGES === 'true') {
    // This would be caught during build, but we can warn here
    errors.push(STARTUP_ERRORS.API_ROUTES_STATIC_EXPORT)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

