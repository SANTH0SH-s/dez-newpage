"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceIdParamSchema = exports.serviceIdSchema = void 0;
const zod_1 = require("zod");
exports.serviceIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Service ID must not be empty"),
});
exports.serviceIdParamSchema = zod_1.z.object({
    serviceId: zod_1.z.string().min(1, "Service ID must not be empty"),
});
