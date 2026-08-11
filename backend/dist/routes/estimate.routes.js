"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estimate_controller_1 = require("../controllers/estimate.controller");
const router = express_1.default.Router();
router.post("/calculate", estimate_controller_1.EstimateController.calculate);
exports.default = router;
