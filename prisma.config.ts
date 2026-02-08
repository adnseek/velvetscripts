import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "mysql://root:R4nt4npl4n!@localhost:3306/redstory",
  },
});
