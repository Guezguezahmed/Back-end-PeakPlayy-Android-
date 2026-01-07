export default () => ({
  // Database configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dam_database',

  // JWT configuration
  jwt: {
    // Fournit des valeurs par défaut solides pour résoudre les erreurs de type
    secret: process.env.JWT_SECRET || 'DAM_DEFAULT_SECRET_KEY_NEVER_USE_IN_PROD',
    expiresIn: process.env.JWT_EXPIRATION_TIME || '3600s', // Doit être une chaîne
  },

  // Google OAuth 2.0 Credentials
  google: {
    // Fournit des valeurs par défaut solides pour résoudre les erreurs de type
    clientId: process.env.GOOGLE_CLIENT_ID || 'NO_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'NO_GOOGLE_CLIENT_SECRET',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/redirect',
  },

  // Application URLs
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',

  // Vonage OTP Configuration
  vonage: {
    apiKey: process.env.VONAGE_API_KEY || '',
    apiSecret: process.env.VONAGE_API_SECRET || '',
    brandName: process.env.VONAGE_BRAND_NAME || 'Vonage',
  },
});