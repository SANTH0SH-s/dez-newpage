import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import publicRouter from "./routes/public.routes";

const app = express();

// Middlewares
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Base V1 Router
const v1Router = express.Router();

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
v1Router.use("/", publicRouter);

app.use("/api/v1", v1Router);

// Centralized error handling
app.use(errorHandler);

export default app;
