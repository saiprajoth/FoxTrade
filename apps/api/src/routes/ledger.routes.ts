import { Router } from "express";
import { z } from "zod";
import { getUserLedgerEntries } from "../services/ledger.service";

const router = Router();

const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

const ledgerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

router.get("/users/:userId/ledger", async (req, res) => {
  try {
    const parsedParams = userIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
        errors: parsedParams.error.flatten(),
      });
    }

    const parsedQuery = ledgerQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ledger query",
        errors: parsedQuery.error.flatten(),
      });
    }

    const entries = await getUserLedgerEntries({
      userId: parsedParams.data.userId,
      limit: parsedQuery.data.limit,
    });

    return res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("Failed to fetch ledger entries:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;