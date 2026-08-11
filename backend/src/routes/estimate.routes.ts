import express from "express";
import { EstimateController } from "../controllers/estimate.controller";

const router = express.Router();

router.post("/calculate", EstimateController.calculate);

export default router;
