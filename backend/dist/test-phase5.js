"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./config/env");
const PORT = 4001;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
let server;
let adminToken;
let testEstimateId;
let testEnquiryId;
async function setup() {
    server = app_1.default.listen(PORT);
    console.log(`Test server started on port ${PORT}`);
    // Fetch admin account to generate JWT
    const admin = await database_1.prisma.adminAccount.findFirst();
    if (!admin) {
        throw new Error("No admin account found in the database. Please seed first.");
    }
    adminToken = jsonwebtoken_1.default.sign({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
    }, env_1.env.JWT_SECRET, {
        expiresIn: "1h",
    });
}
async function teardown() {
    if (server) {
        server.close();
        console.log("Test server stopped.");
    }
}
async function runTests() {
    console.log("--- Starting Phase 5 Tests ---");
    // TEST 1: Calculation endpoint should not create database records
    console.log("\n[Test 1] POST /api/v1/estimates/calculate (Calculation Only)");
    const initialEstimateCount = await database_1.prisma.estimate.count();
    const calcRes = await fetch(`${BASE_URL}/estimates/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            services: [
                {
                    serviceId: "website-dev",
                    packageId: "web-std-no-domain",
                    answers: { "extra-pages": 2 },
                    addons: []
                }
            ],
            multipliers: {
                complexity: "medium",
                urgency: "normal",
                quality: "standard"
            }
        })
    });
    const calcData = await calcRes.json();
    if (!calcRes.ok || !calcData.success) {
        throw new Error(`Calculation failed: ${JSON.stringify(calcData)}`);
    }
    const postCalcCount = await database_1.prisma.estimate.count();
    if (initialEstimateCount !== postCalcCount) {
        throw new Error("Calculation endpoint created an estimate in the database! It must remain calculation-only.");
    }
    console.log("Pass: Calculation endpoint does not create DB records.");
    // TEST 2: Create estimate with client financial values (which must be ignored/recalculated)
    console.log("\n[Test 2] POST /api/v1/estimates (Estimate Creation with Recalculation)");
    const createRes = await fetch(`${BASE_URL}/estimates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            services: [
                {
                    serviceId: "website-dev",
                    packageId: "web-std-no-domain",
                    answers: { "extra-pages": 2 },
                    addons: []
                }
            ],
            multipliers: {
                complexity: "medium",
                urgency: "normal",
                quality: "standard"
            },
            // Client price tampering payload: should be ignored!
            totalPrice: 1.0,
            subtotal: 1.0,
            taxAmount: 0,
            customer: {
                name: "Test Customer",
                email: "test@example.com",
                phone: "+91 99999 88888",
                company: "Test Corp",
                notes: "Some test notes."
            }
        })
    });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.success) {
        throw new Error(`Estimate creation failed: ${JSON.stringify(createData)}`);
    }
    testEstimateId = createData.data.id;
    if (!testEstimateId) {
        throw new Error("Estimate created but no ID returned.");
    }
    if (Math.round(createData.data.totalPrice) === 1) {
        throw new Error("Client price tampering succeeded! Server did not recalculate.");
    }
    console.log(`Pass: Estimate created successfully. Recalculated totalPrice: ${createData.data.totalPrice}`);
    // TEST 3: Database Verification of Estimate Selections
    console.log("\n[Test 3] DB Verification of Selections");
    const dbEstimate = await database_1.prisma.estimate.findUnique({
        where: { id: testEstimateId },
        include: {
            selectedServices: {
                include: {
                    selectedPackage: true,
                    selectedAddons: true
                }
            },
            enquiry: true
        }
    });
    if (!dbEstimate) {
        throw new Error("Could not find created estimate in database.");
    }
    if (dbEstimate.selectedServices.length !== 1) {
        throw new Error("Selected service not saved.");
    }
    const srv = dbEstimate.selectedServices[0];
    if (srv.serviceId !== "website-dev" || srv.serviceName !== "Website Development") {
        throw new Error("Service snapshot invalid.");
    }
    if (!srv.selectedPackage || srv.selectedPackage.packageId !== "web-std-no-domain") {
        throw new Error("Package snapshot missing or invalid.");
    }
    if (!dbEstimate.enquiry) {
        throw new Error("Enquiry not created/linked automatically when customer info was provided.");
    }
    testEnquiryId = dbEstimate.enquiry.id;
    console.log(`Pass: DB verification succeeded. Enquiry linked: ${testEnquiryId}`);
    // TEST 4: Standalone Enquiry Creation
    console.log("\n[Test 4] POST /api/v1/enquiries (Standalone Enquiry)");
    const standaloneEnqRes = await fetch(`${BASE_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Enquiry Lead",
            email: "enquiry@example.com",
            phone: "+91 88888 77777",
            company: "Standalone Corp",
            message: "Looking for SEO growth package.",
            selectedServices: ["seo"],
            estimateRange: "₹10,000 - ₹20,000"
        })
    });
    const standaloneEnqData = await standaloneEnqRes.json();
    if (!standaloneEnqRes.ok || !standaloneEnqData.success) {
        throw new Error(`Standalone enquiry creation failed: ${JSON.stringify(standaloneEnqData)}`);
    }
    console.log(`Pass: Standalone enquiry created: ${standaloneEnqData.data.id}`);
    // TEST 5: Standalone Enquiry Linked to Estimate
    console.log("\n[Test 5] POST /api/v1/enquiries with Estimate ID");
    const linkedEnqRes = await fetch(`${BASE_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Linked Lead",
            email: "linked@example.com",
            phone: "+91 77777 66666",
            company: "Linked Corp",
            message: "Please review my estimate.",
            selectedServices: ["website-dev"],
            estimateRange: "₹20,000 - ₹30,000",
            estimateId: testEstimateId
        })
    });
    const linkedEnqData = await linkedEnqRes.json();
    if (!linkedEnqRes.ok || !linkedEnqData.success) {
        throw new Error(`Linked enquiry creation failed: ${JSON.stringify(linkedEnqData)}`);
    }
    console.log(`Pass: Linked enquiry created: ${linkedEnqData.data.id}`);
    // TEST 6: Validation Rejections
    console.log("\n[Test 6] Validation / 400 Rejections");
    // A. Invalid Email
    const badEmailRes = await fetch(`${BASE_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Bad Email",
            email: "not-an-email",
            phone: "1234567890",
            message: "Hello"
        })
    });
    if (badEmailRes.status !== 400) {
        throw new Error(`Expected 400 for bad email, got ${badEmailRes.status}`);
    }
    // B. Invalid Service
    const badServiceRes = await fetch(`${BASE_URL}/estimates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            services: [{ serviceId: "non-existent-service" }]
        })
    });
    if (badServiceRes.status !== 404) {
        throw new Error(`Expected 404/400 for non-existent service, got ${badServiceRes.status}`);
    }
    console.log("Pass: Validation rejections function correctly.");
    // TEST 7: Authentication Protection on Admin endpoints
    console.log("\n[Test 7] Admin API Authentication Protection");
    // Estimates list without token
    const noTokenEstimates = await fetch(`${BASE_URL}/admin/estimates`);
    if (noTokenEstimates.status !== 401) {
        throw new Error(`Expected 401 for unauthorized admin access, got ${noTokenEstimates.status}`);
    }
    // Enquiries list without token
    const noTokenEnquiries = await fetch(`${BASE_URL}/admin/enquiries`);
    if (noTokenEnquiries.status !== 401) {
        throw new Error(`Expected 401 for unauthorized admin access, got ${noTokenEnquiries.status}`);
    }
    console.log("Pass: Admin endpoints reject requests without valid JWT.");
    // TEST 8: Admin API Access with valid token
    console.log("\n[Test 8] Admin API Access with Valid JWT");
    const authEstimates = await fetch(`${BASE_URL}/admin/estimates`, {
        headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const estimatesData = await authEstimates.json();
    if (!authEstimates.ok || !estimatesData.success) {
        throw new Error(`Authorized admin estimates fetch failed: ${JSON.stringify(estimatesData)}`);
    }
    const authEnquiries = await fetch(`${BASE_URL}/admin/enquiries`, {
        headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const enquiriesData = await authEnquiries.json();
    if (!authEnquiries.ok || !enquiriesData.success) {
        throw new Error(`Authorized admin enquiries fetch failed: ${JSON.stringify(enquiriesData)}`);
    }
    console.log("Pass: Admin endpoints successfully authorize valid JWT.");
    // TEST 9: Mandatory Snapshot Regression Test
    console.log("\n[Test 9] Mandatory Snapshot Regression Test");
    // 1. Fetch current price of standard package
    const originalPkg = await database_1.prisma.package.findUnique({
        where: { id: "web-std-no-domain" }
    });
    if (!originalPkg) {
        throw new Error("Could not find web-std-no-domain package in DB.");
    }
    const originalPrice = originalPkg.price;
    console.log(`Step 1: Original package price is ${originalPrice}`);
    // 2. Modify the package price in the configuration database
    await database_1.prisma.package.update({
        where: { id: "web-std-no-domain" },
        data: { price: 99999.00 }
    });
    console.log("Step 2: Modified package price temporarily to 99999.00");
    // 3. Retrieve the estimate via admin API
    const getEstRes = await fetch(`${BASE_URL}/admin/estimates/${testEstimateId}`, {
        headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const getEstData = await getEstRes.json();
    if (!getEstRes.ok || !getEstData.success) {
        throw new Error("Failed to retrieve estimate via admin API.");
    }
    const snapshottedPkgPrice = getEstData.data.selectedServices[0].selectedPackage.price;
    console.log(`Step 3: Stored estimate package price retrieved is ${snapshottedPkgPrice}`);
    // 4. Verify historical values remain unchanged
    if (Number(snapshottedPkgPrice) !== Number(originalPrice)) {
        // Restore first to avoid leaving db in bad state!
        await database_1.prisma.package.update({
            where: { id: "web-std-no-domain" },
            data: { price: originalPrice }
        });
        throw new Error(`Regression fail: Stored estimate price changed from ${originalPrice} to ${snapshottedPkgPrice}`);
    }
    console.log("Step 4: Verified historical estimate price remains unchanged.");
    // 5. Restore database configuration
    await database_1.prisma.package.update({
        where: { id: "web-std-no-domain" },
        data: { price: originalPrice }
    });
    console.log("Step 5: Restored package configuration back to original price.");
    console.log("Pass: Mandatory snapshot regression test passed successfully.");
    // Clean up test data
    console.log("\n[Teardown] Cleaning up temporary test records...");
    // Delete linked test enqs/estimates
    await database_1.prisma.selectedPackage.deleteMany({
        where: {
            selectedEstimateService: {
                estimateId: testEstimateId
            }
        }
    });
    await database_1.prisma.selectedEstimateService.deleteMany({
        where: { estimateId: testEstimateId }
    });
    await database_1.prisma.estimate.delete({
        where: { id: testEstimateId }
    });
    await database_1.prisma.enquiry.deleteMany({
        where: {
            OR: [
                { id: testEnquiryId },
                { email: "enquiry@example.com" },
                { email: "linked@example.com" }
            ]
        }
    });
    console.log("Cleanup complete.");
    console.log("\n--- All Tests Passed ---");
}
(async () => {
    try {
        await setup();
        await runTests();
        await teardown();
        process.exit(0);
    }
    catch (error) {
        console.error("Test execution failed:", error);
        await teardown();
        process.exit(1);
    }
})();
