export type AppConfig = {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  databaseUrl: string;
  cors: {
    origin: string | boolean;
    credentials: boolean;
  };
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePort(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim().length === 0) {
    return fallback;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

function parseNodeEnv(value: string | undefined): AppConfig['nodeEnv'] {
  if (value === 'production' || value === 'test' || value === 'development') {
    return value;
  }

  return 'development';
}

export default function configuration(): AppConfig {
  const corsOrigin = process.env.CORS_ORIGIN;

  return {
    nodeEnv: parseNodeEnv(process.env.NODE_ENV),
    port: parsePort(process.env.PORT, 3001),
    databaseUrl: requireEnv('DATABASE_URL'),
    cors: {
      origin:
        corsOrigin === undefined || corsOrigin.trim().length === 0
          ? true
          : corsOrigin,
      credentials: process.env.CORS_CREDENTIALS !== 'false',
    },
  };
}
