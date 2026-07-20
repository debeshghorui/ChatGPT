import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development")
        .describe("The environment to run the application in"),
    DATABASE_URL: z
        .string()
        .url()
        .startsWith("postgresql://")
        .describe("The URL of the PostgreSQL database to connect to"),
});

function createEnv(env: NodeJS.ProcessEnv) {
    const safeParsedEnv = envSchema.safeParse(env);

    if (!safeParsedEnv.success) {
        console.error(
            "Invalid environment variables:",
            safeParsedEnv.error.format(),
        );
        throw new Error(
            `Invalid environment variables: ${safeParsedEnv.error.message}`,
        );
    }

    return safeParsedEnv.data;
}

export const env = createEnv(process.env);
