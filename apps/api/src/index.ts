import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRoutes } from "./routes/health.routes";
import  marketsRoutes  from "./routes/market.routes";
import portfolioRoutes from "./routes/portfolio.routes";
import ledgerRoutes from "./routes/ledger.routes";

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.API_PORT || 4000;

app.use("/health", healthRoutes);
app.use("/api", marketsRoutes);
app.use("/api", portfolioRoutes);
app.use("/api", ledgerRoutes);
app.listen(port, () => {
  console.log(`API service running on http://localhost:${port}`);
});