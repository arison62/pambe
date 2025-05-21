export const databaseConfig = () => ({
  database: {
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    host: process.env.DATABASE_HOST,
    url: process.env.DATABASE_URL,
  },
});

export const jwtConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE,
  },
});
