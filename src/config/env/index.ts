import 'dotenv/config';

export default () => ({
  application: {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_BASE_PATH: process.env.API_BASE_PATH || '/api',
    CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  },
  database: {
    region: process.env.DB_REGION || '',
    endpoint: process.env.DB_ENDPOINT || 'http://localhost:8000',
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.DB_SECRET_ACCESS_KEY || '',
    },
  },
  auth0: {
    audience: process.env.AUTH0_AUDIENCE || '',
    issuerUrl: process.env.AUTH0_ISSUER_URL,
  },
});
