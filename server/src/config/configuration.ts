export type AppConfig = {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  databaseUrl: string;
  cors: {
    origin: string | boolean;
    credentials: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cookie: {
    name: string;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    maxAgeMs: number;
  };
  auth: {
    loginRateLimit: number;
    loginRateTtlMs: number;
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

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim().length === 0) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive integer: ${value}`);
  }

  return parsed;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim().length === 0) {
    return fallback;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

function parseNodeEnv(value: string | undefined): AppConfig['nodeEnv'] {
  if (value === 'production' || value === 'test' || value === 'development') {
    return value;
  }

  return 'development';
}

function parseSameSite(
  value: string | undefined,
): AppConfig['cookie']['sameSite'] {
  if (value === 'lax' || value === 'strict' || value === 'none') {
    return value;
  }

  return 'lax';
}

export default function configuration(): AppConfig {
  const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
  const corsOriginRaw = process.env.CORS_ORIGIN;
  const credentials = parseBoolean(process.env.CORS_CREDENTIALS, true);

  let corsOrigin: string | boolean;
  if (corsOriginRaw === undefined || corsOriginRaw.trim().length === 0) {
    // Reflect request origin — compatible with credentials (never "*").
    corsOrigin = true;
  } else if (corsOriginRaw.trim() === '*') {
    if (credentials) {
      throw new Error(
        'CORS_ORIGIN cannot be "*" when CORS_CREDENTIALS is enabled',
      );
    }
    corsOrigin = '*';
  } else {
    corsOrigin = corsOriginRaw;
  }

  const cookieSecure = parseBoolean(
    process.env.COOKIE_SECURE,
    nodeEnv === 'production',
  );

  return {
    nodeEnv,
    port: parsePort(process.env.PORT, 3001),
    databaseUrl: requireEnv('DATABASE_URL'),
    cors: {
      origin: corsOrigin,
      credentials,
    },
    jwt: {
      secret: requireEnv('JWT_SECRET'),
      expiresIn: process.env.JWT_EXPIRES_IN?.trim() || '1d',
    },
    cookie: {
      name: process.env.AUTH_COOKIE_NAME?.trim() || 'access_token',
      secure: cookieSecure,
      sameSite: parseSameSite(process.env.COOKIE_SAME_SITE),
      maxAgeMs: parsePositiveInt(process.env.COOKIE_MAX_AGE_MS, 86_400_000),
    },
    auth: {
      loginRateLimit: parsePositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT, 5),
      loginRateTtlMs: parsePositiveInt(
        process.env.AUTH_LOGIN_RATE_TTL_MS,
        60_000,
      ),
    },
  };
}
