import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("📶 Connected to PostgreSQL via Prisma Client successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
