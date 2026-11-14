/**
 * Conexión central a PostgreSQL (Google Cloud SQL).
 * Se implementará al activar el backend en src/app/api/.
 */
export const dbConfig = {
  connectionString: process.env.DATABASE_URL ?? "",
};

