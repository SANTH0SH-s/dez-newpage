"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Base V1 Router
const v1Router = express_1.default.Router();
// Health check endpoint
v1Router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: "UP",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});
// Mount Public Routes
v1Router.use("/", public_routes_1.default);
app.use("/api/v1", v1Router);
// Centralized error handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
