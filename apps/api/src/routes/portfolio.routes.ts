import { Router } from "express";
import { z } from "zod";
import { getUserPortfolio } from "../services/portfolio.service";

const router = Router();

const userIdParamsSchema = z.object({
  userId: z.string().uuid()
});

router.get("/users/:userId/portfolio", async (req, res) => {
  try {
    const parsedParams = userIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
        errors: parsedParams.error.flatten()
      });
    }

    const portfolio = await getUserPortfolio(parsedParams.data.userId);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;