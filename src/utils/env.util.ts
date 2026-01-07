/**
 * Utility functions for environment detection
 */

/**
 * Check if the application is running in production
 * Uses multiple heuristics to detect production environment
 */
export function isProduction(): boolean {
  // Check NODE_ENV first (most common)
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // Check if PORT is set (production services usually set PORT)
  // In local development, we usually use a default port
  if (process.env.PORT && process.env.PORT !== '3001' && process.env.PORT !== '3000') {
    return true;
  }

  // Check if BACKEND_URL contains https (production usually uses HTTPS)
  if (process.env.BACKEND_URL && process.env.BACKEND_URL.startsWith('https://')) {
    return true;
  }

  return false;
}

/**
 * Check if the application should use secure cookies
 */
export function shouldUseSecureCookies(): boolean {
  return isProduction();
}

