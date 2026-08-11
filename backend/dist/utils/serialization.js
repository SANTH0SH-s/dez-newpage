"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeData = serializeData;
const library_1 = require("@prisma/client/runtime/library");
/**
 * Recursively converts Decimal values to numbers and maps uppercase Prisma enums
 * to the lowercase formats expected by the frontend.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function serializeData(val) {
    if (val === null || val === undefined) {
        return val;
    }
    // Handle Decimal objects
    if (val instanceof library_1.Decimal ||
        (val.constructor && val.constructor.name === "Decimal") ||
        (typeof val.toNumber === "function")) {
        return val.toNumber();
    }
    // Handle Array
    if (Array.isArray(val)) {
        return val.map(serializeData);
    }
    // Handle Object
    if (typeof val === "object") {
        // If it's a Date object, return ISO string
        if (val instanceof Date) {
            return val.toISOString();
        }
        const res = {};
        for (const key of Object.keys(val)) {
            res[key] = serializeData(val[key]);
        }
        return res;
    }
    // Handle Enum strings (uppercase format to lowercase slug format)
    if (typeof val === "string") {
        switch (val) {
            case "ONE_TIME": return "one-time";
            case "MONTHLY": return "monthly";
            case "FIXED": return "fixed";
            case "PER_UNIT": return "per-unit";
            case "ACTIVE": return "active";
            case "INACTIVE": return "inactive";
            case "RADIO": return "radio";
            case "CHECKBOX": return "checkbox";
            case "SELECT": return "select";
            case "COUNTER": return "counter";
            case "NUMBER": return "number";
            case "TEXT": return "text";
            case "TOGGLE": return "toggle";
            case "FLAT": return "flat";
            case "MULTIPLIER": return "multiplier";
            case "COMPLEXITY": return "complexity";
            case "URGENCY": return "urgency";
            case "QUALITY": return "quality";
            default: return val;
        }
    }
    return val;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
