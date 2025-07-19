import 'dotenv/config';

export default () => ({
  application: {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_BASE_PATH: process.env.API_BASE_PATH || '/api',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'pass',
    name: process.env.DB_NAME || 'database',
  },
});
