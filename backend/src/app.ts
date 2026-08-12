import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import publicRouter from "./routes/public.routes";
import authRouter from "./routes/auth.routes";
import adminRouter from "./routes/admin.routes";
import estimateRouter from "./routes/estimate.routes";
import enquiryRouter from "./routes/enquiry.routes";

const app = express();
app.disable("x-powered-by");

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true } : false,
}));
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

// Mount Auth and Admin Routes
v1Router.use("/auth", authRouter);
v1Router.use("/admin", adminRouter);

// Mount Estimates Route
v1Router.use("/estimates", estimateRouter);

// Mount Enquiries Route
v1Router.use("/enquiries", enquiryRouter);

app.use("/api/v1", v1Router);

// Centralized error handling
app.use(errorHandler);

export default app;
