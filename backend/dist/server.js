"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const PORT = env_1.env.PORT;
const startServer = async () => {
    try {
        // Verify database connection
        await database_1.prisma.$connect();
        console.log("📶 Connected to PostgreSQL via Prisma Client successfully!");
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT} in ${env_1.env.NODE_ENV} mode.`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start the server:", error);
        process.exit(1);
    }
};
startServer();
