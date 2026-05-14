import { Router } from "express";
import { prisma } from "@repo/db";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  res.json({
    service: "api",
    status: "ok"
  });
});

healthRoutes.get("/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      service: "database",
      status: "ok"
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      service: "database",
      status: "error"
    });
  }
});