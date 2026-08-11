"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTimeline = void 0;
const calculateTimeline = (baselineTimeline, activeAddonsCount, complexity, urgency) => {
    let min = 2;
    let max = 4;
    let unit = "weeks";
    const numbers = baselineTimeline.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        if (numbers.length === 1) {
            min = parseInt(numbers[0]);
            max = min;
        }
        else {
            min = parseInt(numbers[0]);
            max = parseInt(numbers[1]);
        }
    }
    if (baselineTimeline.toLowerCase().includes("day")) {
        unit = "days";
    }
    const addonImpactDays = activeAddonsCount * 2;
    let minDays = unit === "weeks" ? min * 7 : min;
    let maxDays = unit === "weeks" ? max * 7 : max;
    minDays += addonImpactDays;
    maxDays += addonImpactDays;
    let complexityMultiplier = 1.0;
    if (complexity === "medium")
        complexityMultiplier = 1.25;
    else if (complexity === "complex")
        complexityMultiplier = 1.5;
    let urgencyMultiplier = 1.0;
    if (urgency === "fast")
        urgencyMultiplier = 0.75;
    else if (urgency === "urgent")
        urgencyMultiplier = 0.5;
    minDays = Math.max(3, Math.round(minDays * complexityMultiplier * urgencyMultiplier));
    maxDays = Math.max(4, Math.round(maxDays * complexityMultiplier * urgencyMultiplier));
    if (minDays >= 7 || maxDays >= 7) {
        const minWeeks = Math.round((minDays / 7) * 10) / 10;
        const maxWeeks = Math.round((maxDays / 7) * 10) / 10;
        const label = minWeeks === maxWeeks ? `${minWeeks} Weeks` : `${minWeeks}-${maxWeeks} Weeks`;
        return { minWeeks, maxWeeks, label };
    }
    else {
        const label = minDays === maxDays ? `${minDays} Days` : `${minDays}-${maxDays} Days`;
        return { minWeeks: minDays / 7, maxWeeks: maxDays / 7, label };
    }
};
exports.calculateTimeline = calculateTimeline;
