import { ENV } from "./src/config/env";

console.log("url", ENV.DB_URL);
export default {
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: ENV.DB_URL,
    },
    out: "./src/db/migrations",
}