"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load environment variables from backend directory .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    PORT: zod_1.z.coerce.number().default(5000),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    JWT_SECRET: zod_1.z.string().min(8),
    JWT_EXPIRES_IN: zod_1.z.string().default("24h"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:3000"),
    ADMIN_EMAIL: zod_1.z.string().email(),
    ADMIN_PASSWORD: zod_1.z.string().min(8),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    process.exit(1);
}
exports.env = result.data;
