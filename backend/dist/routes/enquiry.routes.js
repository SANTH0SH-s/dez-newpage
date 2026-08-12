"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enquiry_controller_1 = require("../controllers/enquiry.controller");
const router = express_1.default.Router();
router.post("/", enquiry_controller_1.EnquiryController.create);
exports.default = router;
