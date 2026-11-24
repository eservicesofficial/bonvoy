import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// The database file is committed at <project-root>/db/custom.db.
// Ignore the stale development path that was present in the original ZIP.
const bundledDatabaseUrl = `file:${path.resolve(process.cwd(), "db", "custom.db")}`;
const configuredDatabaseUrl = process.env.DATABASE_URL?.trim();
const isStaleDevelopmentPath = configuredDatabaseUrl?.includes("/home/z/my-project/") ?? false;
const databaseUrl =
  configuredDatabaseUrl && !isStaleDevelopmentPath
    ? configuredDatabaseUrl
    : bundledDatabaseUrl;

// Prisma reads this variable from the schema; set a safe fallback for hosts
// where the ignored .env file is not uploaded from GitHub.
process.env.DATABASE_URL = databaseUrl;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
