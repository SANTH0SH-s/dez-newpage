"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingEngine = void 0;
const library_1 = require("@prisma/client/runtime/library");
const pricing_helpers_1 = require("./pricing.helpers");
const error_middleware_1 = require("../middleware/error.middleware");
class PricingEngine {
    static calculate(input, services, dbMultipliers, settings) {
        const servicesBreakdown = [];
        let totalBaseCost = new library_1.Decimal(0);
        let totalCalculatedCost = new library_1.Decimal(0);
        for (const serviceInput of input.services) {
            const service = services.find((s) => s.id === serviceInput.serviceId);
            if (!service || service.status !== "ACTIVE") {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Active service ${serviceInput.serviceId} not found`);
            }
            const serviceAnswers = serviceInput.answers || {};
            const selectedPackageId = serviceAnswers["selected-package"];
            let basePrice = new library_1.Decimal(service.basePrice);
            let baseLabel = `${service.name} (Base Service)`;
            let isBaseMonthly = false;
            if (selectedPackageId) {
                const pkg = service.packages.find((p) => p.id === selectedPackageId);
                if (!pkg || pkg.status !== "ACTIVE") {
                    throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Active package ${selectedPackageId} does not belong to service ${service.id}`);
                }
                basePrice = new library_1.Decimal(pkg.price);
                baseLabel = `${service.name} (${pkg.name} Package)`;
                if (pkg.timeline === "Monthly") {
                    isBaseMonthly = true;
                }
            }
            else if (service.id === "seo") {
                isBaseMonthly = true;
            }
            totalBaseCost = totalBaseCost.add(basePrice);
            const details = [
                {
                    id: `${service.id}-base`,
                    name: baseLabel,
                    type: "base",
                    costLabel: `${settings.currency}${Number(basePrice).toLocaleString()}${isBaseMonthly ? "/month" : ""}`,
                    amount: Number(basePrice),
                    billingCycle: isBaseMonthly ? "monthly" : "one-time",
                },
            ];
            let flatAddons = new library_1.Decimal(0);
            let multiplierProduct = new library_1.Decimal(1.0);
            // Collect service-level questions plus package-specific questions
            let allQuestions = [...service.questions];
            if (selectedPackageId) {
                const pkg = service.packages.find((p) => p.id === selectedPackageId);
                if (pkg && pkg.questions) {
                    allQuestions = [...allQuestions, ...pkg.questions];
                }
            }
            // Dynamic question validation & pricing impact
            for (const question of allQuestions) {
                const selectedValue = serviceAnswers[question.id];
                // Conditional visibility check
                if (question.conditionalParentId) {
                    const parentVal = serviceAnswers[question.conditionalParentId];
                    let isVisible = false;
                    if (parentVal !== undefined && parentVal !== null && parentVal !== "") {
                        if (Array.isArray(parentVal)) {
                            isVisible = parentVal.includes(question.conditionalParentValue);
                        }
                        else {
                            isVisible = String(parentVal) === String(question.conditionalParentValue);
                        }
                    }
                    if (!isVisible)
                        continue; // Skip question validation and calculation if not visible
                }
                // Required question validation
                if (question.isRequired && (selectedValue === undefined || selectedValue === null || selectedValue === "")) {
                    throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Answer to required question ${question.id} is missing`);
                }
                if (selectedValue === undefined || selectedValue === null || selectedValue === "")
                    continue;
                // Validation Rules (min, max, etc.)
                if (question.validationRule) {
                    const rule = question.validationRule;
                    if (["counter", "number"].includes(question.type)) {
                        const valNum = Number(selectedValue);
                        if (isNaN(valNum)) {
                            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Value for ${question.id} must be a number`);
                        }
                        if (rule.min !== null && rule.min !== undefined && valNum < rule.min) {
                            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Value for ${question.id} cannot be less than ${rule.min}`);
                        }
                        if (rule.max !== null && rule.max !== undefined && valNum > rule.max) {
                            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Value for ${question.id} cannot be more than ${rule.max}`);
                        }
                    }
                    if (question.type === "TEXT" && typeof selectedValue === "string") {
                        const length = selectedValue.length;
                        if (rule.min !== null && rule.min !== undefined && length < rule.min) {
                            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Length of text for ${question.id} cannot be less than ${rule.min}`);
                        }
                        if (rule.max !== null && rule.max !== undefined && length > rule.max) {
                            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Length of text for ${question.id} cannot be more than ${rule.max}`);
                        }
                    }
                }
                // Apply pricing modifier by question type
                // A. Radio, Checkbox, Dropdown
                if (["RADIO", "CHECKBOX", "SELECT"].includes(question.type) && question.options) {
                    const submittedArray = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
                    for (const optVal of submittedArray) {
                        const option = question.options.find((o) => o.value === String(optVal));
                        if (!option) {
                            throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Invalid option value '${optVal}' for question ${question.id}`);
                        }
                        const mod = new library_1.Decimal(option.priceModifier);
                        if (option.modifierType === "FLAT") {
                            if (!mod.isZero()) {
                                flatAddons = flatAddons.add(mod);
                                details.push({
                                    id: `${service.id}-${question.id}-${option.value}`,
                                    name: `${question.text}: ${option.label}`,
                                    type: "addon",
                                    costLabel: `+${settings.currency}${Number(mod).toLocaleString()}`,
                                    amount: Number(mod),
                                });
                            }
                        }
                        else if (option.modifierType === "MULTIPLIER") {
                            if (Number(mod) !== 1.0) {
                                multiplierProduct = multiplierProduct.mul(mod);
                                details.push({
                                    id: `${service.id}-${question.id}-${option.value}`,
                                    name: `${question.text}: ${option.label}`,
                                    type: "multiplier",
                                    costLabel: `${Number(mod) > 1 ? "+" : ""}${Math.round((Number(mod) - 1) * 100)}%`,
                                    amount: Number(mod),
                                });
                            }
                        }
                    }
                }
                // B. Toggle
                if (question.type === "TOGGLE" && selectedValue === true) {
                    const mod = new library_1.Decimal(question.priceModifier);
                    const type = question.modifierType || "FLAT";
                    if (type === "FLAT" && !mod.isZero()) {
                        flatAddons = flatAddons.add(mod);
                        details.push({
                            id: `${service.id}-${question.id}`,
                            name: `${question.text}: Yes`,
                            type: "addon",
                            costLabel: `+${settings.currency}${Number(mod).toLocaleString()}`,
                            amount: Number(mod),
                        });
                    }
                    else if (type === "MULTIPLIER" && Number(mod) !== 1.0 && !mod.isZero()) {
                        multiplierProduct = multiplierProduct.mul(mod);
                        details.push({
                            id: `${service.id}-${question.id}`,
                            name: `${question.text}: Yes`,
                            type: "multiplier",
                            costLabel: `${Number(mod) > 1 ? "+" : ""}${Math.round((Number(mod) - 1) * 100)}%`,
                            amount: Number(mod),
                        });
                    }
                }
                // C. Counter / Number
                if (["COUNTER", "NUMBER"].includes(question.type)) {
                    const val = Number(selectedValue);
                    const mod = new library_1.Decimal(question.priceModifier);
                    const type = question.modifierType || "FLAT";
                    if (val > 0 && !mod.isZero()) {
                        if (type === "FLAT") {
                            const cost = mod.mul(val);
                            flatAddons = flatAddons.add(cost);
                            details.push({
                                id: `${service.id}-${question.id}`,
                                name: `${question.text} (${val})`,
                                type: "addon",
                                costLabel: `+${settings.currency}${Number(cost).toLocaleString()}`,
                                amount: Number(cost),
                            });
                        }
                        else if (type === "MULTIPLIER") {
                            const factor = new library_1.Decimal(1.0).add(mod.sub(1.0).mul(val));
                            multiplierProduct = multiplierProduct.mul(factor);
                            details.push({
                                id: `${service.id}-${question.id}`,
                                name: `${question.text} (${val})`,
                                type: "multiplier",
                                costLabel: `+${Math.round((Number(factor) - 1.0) * 100)}%`,
                                amount: Number(factor),
                            });
                        }
                    }
                }
                // D. Text
                if (question.type === "TEXT" && typeof selectedValue === "string" && selectedValue.trim() !== "") {
                    const mod = new library_1.Decimal(question.priceModifier);
                    if (question.id === "custom-requirements") {
                        details.push({
                            id: `${service.id}-${question.id}`,
                            name: `${question.text}: ${selectedValue}`,
                            type: "addon",
                            costLabel: "Enquire the team",
                            amount: 0,
                        });
                    }
                    else if (!mod.isZero()) {
                        flatAddons = flatAddons.add(mod);
                        details.push({
                            id: `${service.id}-${question.id}`,
                            name: `${question.text} (Custom)`,
                            type: "addon",
                            costLabel: `+${settings.currency}${Number(mod).toLocaleString()}`,
                            amount: Number(mod),
                        });
                    }
                }
            }
            // Custom Pricing Components (Add-ons)
            const selectedComponentsInput = serviceInput.addons || [];
            const selectedComponentIds = selectedComponentsInput.map((a) => a.pricingComponentId);
            for (const compInput of selectedComponentsInput) {
                const comp = service.components.find((c) => c.id === compInput.pricingComponentId);
                if (!comp || comp.status !== "ACTIVE") {
                    throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Active pricing component ${compInput.pricingComponentId} not found in service ${service.id}`);
                }
                const billing = comp.billingCycle === "ONE_TIME" ? "one-time" : "monthly";
                const cycleSuffix = billing === "monthly" ? "/month" : "";
                if (comp.pricingType === "FIXED") {
                    const price = new library_1.Decimal(comp.price);
                    flatAddons = flatAddons.add(price);
                    details.push({
                        id: comp.id,
                        name: `Add-on: ${comp.name}`,
                        type: "addon",
                        costLabel: `+${settings.currency}${Number(price).toLocaleString()}${cycleSuffix}`,
                        amount: Number(price),
                        billingCycle: billing,
                    });
                }
                else if (comp.pricingType === "PER_UNIT") {
                    let units = compInput.units;
                    if (comp.maxQuantity !== null && comp.maxQuantity !== undefined && comp.maxQuantity > 0) {
                        units = Math.min(units, comp.maxQuantity);
                    }
                    const price = new library_1.Decimal(comp.price);
                    const cost = price.mul(units);
                    flatAddons = flatAddons.add(cost);
                    details.push({
                        id: comp.id,
                        name: `Add-on: ${comp.name} (${units} ${service.unitType || "units"})`,
                        type: "addon",
                        costLabel: `+${settings.currency}${Number(cost).toLocaleString()}${cycleSuffix}`,
                        amount: Number(cost),
                        billingCycle: billing,
                    });
                }
            }
            const totalCost = basePrice.add(flatAddons).mul(multiplierProduct);
            totalCalculatedCost = totalCalculatedCost.add(totalCost);
            let baselineTimeline = "2-4 Weeks";
            if (selectedPackageId) {
                const pkg = service.packages.find((p) => p.id === selectedPackageId);
                if (pkg)
                    baselineTimeline = pkg.timeline;
            }
            let activeAddonsCount = selectedComponentIds.length;
            Object.entries(serviceAnswers).forEach(([k, v]) => {
                if (k !== "selected-package" && k !== "pricing-components" && k !== "pricing-component-units") {
                    if (Array.isArray(v))
                        activeAddonsCount += v.length;
                    else if (typeof v === "boolean" && v)
                        activeAddonsCount += 1;
                    else if (typeof v === "number" && v > 0)
                        activeAddonsCount += v;
                    else if (typeof v === "string" && v.trim() !== "")
                        activeAddonsCount += 1;
                }
            });
            const timelineResult = (0, pricing_helpers_1.calculateTimeline)(baselineTimeline, activeAddonsCount, input.multipliers.complexity || "simple", input.multipliers.urgency || "normal");
            servicesBreakdown.push({
                serviceId: service.id,
                serviceName: service.name,
                baseCost: Number(basePrice),
                addonsCost: Number(flatAddons),
                multiplierProduct: Number(multiplierProduct),
                totalCost: Number(totalCost),
                details,
                estimatedTimeline: timelineResult.label,
            });
        }
        const compMultiplierOpt = dbMultipliers.find((m) => m.category === "COMPLEXITY" && m.id === (input.multipliers.complexity || "simple")) || { value: new library_1.Decimal(1.0) };
        const urgMultiplierOpt = dbMultipliers.find((m) => m.category === "URGENCY" && m.id === (input.multipliers.urgency || "normal")) || { value: new library_1.Decimal(1.0) };
        const qualMultiplierOpt = dbMultipliers.find((m) => m.category === "QUALITY" && m.id === (input.multipliers.quality || "standard")) || { value: new library_1.Decimal(1.0) };
        const projectMultiplier = new library_1.Decimal(compMultiplierOpt.value).mul(new library_1.Decimal(urgMultiplierOpt.value)).mul(new library_1.Decimal(qualMultiplierOpt.value));
        let oneTimeSubtotal = new library_1.Decimal(0);
        let monthlySubtotal = new library_1.Decimal(0);
        servicesBreakdown.forEach((srv) => {
            let srvOneTime = new library_1.Decimal(0);
            let srvMonthly = new library_1.Decimal(0);
            srv.details.forEach((d) => {
                if (d.type !== "multiplier") {
                    if (d.billingCycle === "monthly") {
                        srvMonthly = srvMonthly.add(d.amount);
                    }
                    else {
                        srvOneTime = srvOneTime.add(d.amount);
                    }
                }
            });
            oneTimeSubtotal = oneTimeSubtotal.add(srvOneTime.mul(srv.multiplierProduct));
            monthlySubtotal = monthlySubtotal.add(srvMonthly.mul(srv.multiplierProduct));
        });
        const finalOneTimeCost = oneTimeSubtotal.mul(projectMultiplier);
        const finalMonthlyCost = monthlySubtotal;
        let oneTimeDiscount = new library_1.Decimal(0);
        let monthlyDiscount = new library_1.Decimal(0);
        const discountRate = new library_1.Decimal(settings.discountRate);
        if (discountRate.gt(0)) {
            oneTimeDiscount = finalOneTimeCost.mul(discountRate.div(100));
            monthlyDiscount = finalMonthlyCost.mul(discountRate.div(100));
        }
        let oneTimeTax = new library_1.Decimal(0);
        let monthlyTax = new library_1.Decimal(0);
        const taxRate = new library_1.Decimal(settings.taxRate);
        if (taxRate.gt(0)) {
            oneTimeTax = finalOneTimeCost.sub(oneTimeDiscount).mul(taxRate.div(100));
            monthlyTax = finalMonthlyCost.sub(monthlyDiscount).mul(taxRate.div(100));
        }
        const oneTimeFinalCost = finalOneTimeCost.sub(oneTimeDiscount).add(oneTimeTax);
        const monthlyFinalCost = finalMonthlyCost.sub(monthlyDiscount).add(monthlyTax);
        let finalCost = oneTimeFinalCost.add(monthlyFinalCost);
        const minCost = new library_1.Decimal(settings.minimumCost);
        const maxCost = new library_1.Decimal(settings.maximumCost);
        if (finalCost.lt(minCost))
            finalCost = minCost;
        if (finalCost.gt(maxCost))
            finalCost = maxCost;
        const estimatedMin = Math.round(Number(finalCost.mul(0.9)) / 100) * 100;
        const estimatedMax = Math.round(Number(finalCost.mul(1.15)) / 100) * 100;
        let maxProjectWeeks = 2;
        let minProjectWeeks = 1;
        let hasTimeline = false;
        servicesBreakdown.forEach((s) => {
            const numbers = s.estimatedTimeline.match(/\d+(\.\d+)?/g);
            if (numbers && numbers.length > 0) {
                hasTimeline = true;
                const val1 = parseFloat(numbers[0]);
                const val2 = numbers[1] ? parseFloat(numbers[1]) : val1;
                if (val2 > maxProjectWeeks)
                    maxProjectWeeks = val2;
                if (val1 < minProjectWeeks)
                    minProjectWeeks = val1;
            }
        });
        const finalProjectTimeline = hasTimeline
            ? (minProjectWeeks === maxProjectWeeks ? `${minProjectWeeks} Weeks` : `${minProjectWeeks}-${maxProjectWeeks} Weeks`)
            : "2-4 Weeks";
        return {
            services: servicesBreakdown,
            totalBaseCost: Number(totalBaseCost),
            totalCalculatedCost: Number(totalCalculatedCost),
            estimatedMin,
            estimatedMax,
            taxAmount: Number(oneTimeTax.add(monthlyTax)),
            discountAmount: Number(oneTimeDiscount.add(monthlyDiscount)),
            finalCost: Number(finalCost),
            estimatedTimeline: finalProjectTimeline,
            oneTimeSubtotal: Number(oneTimeSubtotal),
            monthlySubtotal: Number(monthlySubtotal),
            oneTimeDiscount: Number(oneTimeDiscount),
            monthlyDiscount: Number(monthlyDiscount),
            oneTimeTax: Number(oneTimeTax),
            monthlyTax: Number(monthlyTax),
            oneTimeFinalCost: Number(oneTimeFinalCost),
            monthlyFinalCost: Number(monthlyFinalCost),
            currency: settings.currency,
        };
    }
}
exports.PricingEngine = PricingEngine;
