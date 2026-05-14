import { Router } from "express";
import { getActiveAssets, getActiveMarkets } from "../services/market.service";

const router = Router();

router.get("/assets", async (_req, res) => {
  try {
    const assets = await getActiveAssets();

    return res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Failed to fetch assets:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/markets", async (_req, res) => {
  try {
    const markets = await getActiveMarkets();

    return res.status(200).json({
      success: true,
      data: markets,
    });
  } catch (error) {
    console.error("Failed to fetch markets:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;