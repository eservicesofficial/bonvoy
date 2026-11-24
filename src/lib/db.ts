
import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Find the actual bundled SQLite database.
const databaseCandidates = [
  path.resolve(process.cwd(), "db", "custom.db"),
  path.resolve(process.cwd(), ".next", "standalone", "db", "custom.db"),
  path.resolve(process.cwd(), "../db", "custom.db"),
];

const databasePath = databaseCandidates.find((candidate) =>
  fs.existsSync(candidate)
);

if (!databasePath) {
  console.error(
    "[Database] SQLite database not found.",
    databaseCandidates
  );

  throw new Error(
    "SQLite database file db/custom.db was not found."
  );
}

// Always use the verified database file.
const databaseUrl = `file:${databasePath}`;

process.env.DATABASE_URL = databaseUrl;

console.log("[Database] Using SQLite:", databasePath);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
