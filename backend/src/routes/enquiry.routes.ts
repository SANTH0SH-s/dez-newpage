import express from "express";
import { EnquiryController } from "../controllers/enquiry.controller";

const router = express.Router();

router.post("/", EnquiryController.create);

export default router;
