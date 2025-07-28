import env from '@config/env';

const allowedOrigins = env()
  .application.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const CorsConfig = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || env().application.NODE_ENV !== 'production')
      return cb(null, true);
    return cb(new Error(`CORS: ${origin} is not allowed`), false);
  },
  methods: 'GET,HEAD,PATCH,POST,OPTIONS',
  allowedHeaders: 'Content-Type',
};
