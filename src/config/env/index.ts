import 'dotenv/config';

export default () => ({
  application: {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_BASE_PATH: process.env.API_BASE_PATH || '/api',
  },
});
