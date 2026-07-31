import { openai } from "@ai-sdk/openai";
import { env } from "@/env";

export const DEFAULT_MODEL = env.OPENAI_MODEL;

export function getModel(modelId?: string) {
    return openai(modelId || DEFAULT_MODEL);
}
