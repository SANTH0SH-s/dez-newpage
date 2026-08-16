
import { PrismaClient } from "@prisma/client";

const API_URL = "http://localhost:4000/api/v1";
const prisma = new PrismaClient();

async function runTests() {
  let token = "";
  let adminId = "";
  console.log("=== PHASE 1: PUBLIC API ===");
  try {
    const health = await fetch(`${API_URL}/health`);
    console.log(`Health: ${health.status}`);
    const services = await fetch(`${API_URL}/services`);
    console.log(`Services: ${services.status}`);
    const multipliers = await fetch(`${API_URL}/multipliers`);
    console.log(`Multipliers: ${multipliers.status}`);
    const settings = await fetch(`${API_URL}/settings/public`);
    console.log(`Settings: ${settings.status}`);
  } catch (e: any) { console.error("Phase 1 failed:", e.message); }

  console.log("\n=== PHASE 2: AUTH ===");
  try {
    const login = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@dezprox.local", password: "TemporaryDevPassword123!" })
    });
    console.log(`Login status: ${login.status}`);
    const loginData = await login.json() as any;
    token = loginData.data.token;
    adminId = loginData.data.id;
    console.log(`Got token: ${!!token}`);

    const me = await fetch(`${API_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log(`Auth me status: ${me.status}`);

    const invalid = await fetch(`${API_URL}/auth/me`, {
      headers: { "Authorization": `Bearer invalid-token` }
    });
    console.log(`Invalid auth me status: ${invalid.status} (Expected 401)`);
  } catch (e: any) { console.error("Phase 2 failed:", e.message); }

  console.log("\n=== PHASE 5: ESTIMATE ===");
  let estimateId = "";
  try {
    const estReq = {
      customerName: "Test User",
      customerEmail: "test@example.com",
      selectedServices: [
        {
          serviceId: "website-dev",
          packageId: "web-nocode",
          addons: []
        }
      ],
      answers: {}
    };
    const estRes = await fetch(`${API_URL}/estimates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estReq)
    });
    console.log(`Estimate Create Status: ${estRes.status}`);
    if (estRes.ok) {
      const estData = await estRes.json() as any;
      estimateId = estData.data.id;
      console.log(`Created Estimate ID: ${estimateId}`);
    } else {
      console.log(await estRes.text());
    }
  } catch (e: any) { console.error("Phase 5 failed:", e.message); }

  console.log("\n=== PHASE 6: ENQUIRY ===");
  let enquiryId = "";
  try {
    const enqReq = {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      estimateRange: "1000-5000",
      message: "Test enquiry",
      selectedServices: ["website-dev"]
    };
    const enqRes = await fetch(`${API_URL}/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enqReq)
    });
    console.log(`Enquiry Create Status: ${enqRes.status}`);
    if (enqRes.ok) {
      const enqData = await enqRes.json() as any;
      enquiryId = enqData.data.id;
      console.log(`Created Enquiry ID: ${enquiryId}`);
    } else {
      console.log(await enqRes.text());
    }
  } catch (e: any) { console.error("Phase 6 failed:", e.message); }

  console.log("\n=== CLEANUP ===");
  try {
    if (estimateId) await prisma.estimate.delete({ where: { id: estimateId } });
    if (enquiryId) await prisma.enquiry.delete({ where: { id: enquiryId } });
    console.log("Cleanup successful");
  } catch (e: any) { console.error("Cleanup failed:", e.message); }
  
  await prisma.$disconnect();
}

runTests();
