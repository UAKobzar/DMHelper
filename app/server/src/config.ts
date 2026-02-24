import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  LLM_PROVIDER: (process.env.LLM_PROVIDER || "anthropic") as
    | "anthropic"
    | "openai"
    | "ollama"
    | "llamacpp",
  LLM_MODEL: process.env.LLM_MODEL || "claude-opus-4-6",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  LLAMACPP_URL: process.env.LLAMACPP_URL || "http://localhost:8080",
  PORT: parseInt(process.env.PORT || "3001"),
  DATA_DIR: path.resolve(__dirname, "../../..", "data"),
  MODES_DIR: path.resolve(__dirname, "../../..", "modes"),
};
