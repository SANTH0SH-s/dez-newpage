import { PrismaClient, Status, PricingType, BillingCycle, QuestionType, ModifierType, MultiplierCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Seed Admin Account
  const email = process.env.ADMIN_EMAIL || "admin@dezprox.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("❌ Seeding failed: ADMIN_PASSWORD environment variable is not defined.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminAccount.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      name: "Dezprox Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin account seeded: ${admin.email}`);

  // 2. Seed Global Settings
  const settings = await prisma.globalSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Dezprox Solutions",
      currency: "₹",
      taxRate: 18.0,
      discountRate: 0.0,
      defaultPricingMode: "Standard Additive",
      minimumCost: 500,
      maximumCost: 100000,
      whatsappNumber: "+15550199000",
      gateEstimateWithLeadForm: false,
    },
  });
  console.log(`✅ Global Settings seeded.`);

  // 3. Seed Multipliers
  const multipliersData = [
    // Complexity
    { id: "simple", category: MultiplierCategory.COMPLEXITY, label: "Simple", value: 1.0, description: "Standard template-based work" },
    { id: "medium", category: MultiplierCategory.COMPLEXITY, label: "Medium", value: 1.3, description: "Custom UI elements and API integrations" },
    { id: "complex", category: MultiplierCategory.COMPLEXITY, label: "Complex", value: 1.6, description: "Advanced features, custom backend, auth" },
    // Urgency
    { id: "normal", category: MultiplierCategory.URGENCY, label: "Normal", value: 1.0, description: "Standard delivery timeline" },
    { id: "fast", category: MultiplierCategory.URGENCY, label: "Fast", value: 1.25, description: "Expedited delivery" },
    { id: "urgent", category: MultiplierCategory.URGENCY, label: "Urgent", value: 1.5, description: "Priority delivery" },
    // Quality
    { id: "basic", category: MultiplierCategory.QUALITY, label: "Basic", value: 0.9, description: "Functional release, MVP standards" },
    { id: "standard", category: MultiplierCategory.QUALITY, label: "Standard", value: 1.0, description: "High quality production release" },
    { id: "premium", category: MultiplierCategory.QUALITY, label: "Premium", value: 1.3, description: "Elite graphics and micro-interactions" },
  ];

  for (const item of multipliersData) {
    await prisma.multiplier.upsert({
      where: { id: item.id },
      update: {
        category: item.category,
        label: item.label,
        value: item.value,
        description: item.description,
      },
      create: item,
    });
  }
  console.log(`✅ Multipliers seeded.`);

  // 4. Seed Services
  const servicesData = [
    {
      id: "website-dev",
      name: "Website Development",
      category: "Development",
      description: "Tailor-made, responsive websites built for speed, SEO, and conversions.",
      iconName: "Globe",
      basePrice: 12999.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
    {
      id: "ecommerce-dev",
      name: "E-Commerce",
      category: "Development",
      description: "Stunning digital shopfronts integrated with secure payment systems and inventory management.",
      iconName: "ShoppingBag",
      basePrice: 30000.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
    {
      id: "branding",
      name: "Graphic Design",
      category: "Design",
      description: "Memorable corporate identity, brand books, custom logos, and guidelines design.",
      iconName: "Award",
      basePrice: 4999.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
    {
      id: "digital-marketing",
      name: "Digital Marketing",
      category: "Marketing",
      description: "High-yield lead generation, paid acquisition campaigns, and strategic content planning.",
      iconName: "Megaphone",
      basePrice: 999.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
    {
      id: "seo",
      name: "SEO Packages",
      category: "Marketing",
      description: "Boost organic search rankings, domain authority, and targeted search traffic.",
      iconName: "Search",
      basePrice: 9999.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
    {
      id: "uiux-design",
      name: "UI/UX Design",
      category: "Design",
      description: "Stunning user experience journeys and interfaces backed by extensive user research.",
      iconName: "Palette",
      basePrice: 0.00,
      unitType: "Screen",
      status: Status.ACTIVE,
    },
    {
      id: "mobile-app",
      name: "App Development",
      category: "Development",
      description: "Premium iOS and Android apps crafted using state-of-the-art native and hybrid frameworks.",
      iconName: "Smartphone",
      basePrice: 0.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
    {
      id: "software-dev",
      name: "Custom Software",
      category: "Development",
      description: "Custom ERPs, API architectures, and enterprise business automation portals.",
      iconName: "Code",
      basePrice: 0.00,
      unitType: "Project",
      status: Status.ACTIVE,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
        iconName: s.iconName,
        basePrice: s.basePrice,
        unitType: s.unitType,
        status: s.status,
      },
      create: s,
    });
  }
  console.log(`✅ Base Services seeded.`);

  // 5. Seed Packages & Features
  const packagesData = [
    // Website Dev Packages
    {
      id: "web-std-no-domain",
      serviceId: "website-dev",
      name: "Standard (Code, No Domain)",
      price: 12999.00,
      timeline: "2 Weeks",
      description: "Standard business website without custom domain configuration.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 0,
      status: Status.ACTIVE,
      features: ["Standard Code", "No Domain Included", "Responsive Layout"],
    },
    {
      id: "web-std-with-domain",
      serviceId: "website-dev",
      name: "Standard (Code + Domain)",
      price: 14999.00,
      timeline: "2 Weeks",
      description: "Standard business website with custom domain configuration included.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 1,
      status: Status.ACTIVE,
      features: ["Standard Code", "Domain Included (1 Year)", "Responsive Layout"],
    },
    {
      id: "web-nocode",
      serviceId: "website-dev",
      name: "No-Code Website",
      price: 11999.00,
      timeline: "1 Week",
      description: "Standard website (4 pages, SEO, content).",
      isRecommended: false,
      isPopular: false,
      displayOrder: 2,
      status: Status.ACTIVE,
      features: ["4 pages", "SEO", "Website Content"],
    },
    {
      id: "web-dyn",
      serviceId: "website-dev",
      name: "Dynamic (Code + Domain)",
      price: 19999.00,
      timeline: "4 Weeks",
      description: "Custom dynamic site with admin panel features and domain configuration.",
      isRecommended: true,
      isPopular: true,
      displayOrder: 3,
      status: Status.ACTIVE,
      features: ["Custom Code", "Domain Included (1 Year)"],
    },
    // SEO Packages
    {
      id: "seo-starter",
      serviceId: "seo",
      name: "Starter",
      price: 9999.00,
      timeline: "Monthly",
      description: "Baseline search optimization services.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 0,
      status: Status.ACTIVE,
      features: ["On-Page SEO", "10 Keywords", "Search Console"],
    },
    {
      id: "seo-growth",
      serviceId: "seo",
      name: "Growth",
      price: 19999.00,
      timeline: "Monthly",
      description: "Aggressive keyword ranking growth.",
      isRecommended: true,
      isPopular: true,
      displayOrder: 1,
      status: Status.ACTIVE,
      features: ["Backlinks Building", "30 Keywords", "Competitor Review"],
    },
    {
      id: "seo-premium",
      serviceId: "seo",
      name: "Premium",
      price: 29999.00,
      timeline: "Monthly",
      description: "Enterprise local and search positioning.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 2,
      status: Status.ACTIVE,
      features: ["Elite PR Placement", "Unlimited Keywords", "Dedicated Manager"],
    },
    // E-Commerce Packages
    {
      id: "ecom-basic",
      serviceId: "ecommerce-dev",
      name: "Code Basic",
      price: 50000.00,
      timeline: "2-4 Weeks",
      description: "Standard storefront package. Includes payment verification and delivery booking setup.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 0,
      status: Status.ACTIVE,
      features: ["Product Listing + Cart + Checkout", "UPI/QR Manual Payment", "Delhivery Manual Tracking", "Basic Product Variants"],
    },
    {
      id: "ecom-std",
      serviceId: "ecommerce-dev",
      name: "Code Standard",
      price: 90000.00,
      timeline: "5-7 Weeks",
      description: "Automated payment and carrier integration for growing stores.",
      isRecommended: true,
      isPopular: true,
      displayOrder: 1,
      status: Status.ACTIVE,
      features: ["Everything in Basic", "Razorpay/Cashfree Gateway", "WhatsApp Integration", "Semi-auto Shiprocket Courier"],
    },
    {
      id: "ecom-prem",
      serviceId: "ecommerce-dev",
      name: "Code Premium",
      price: 120000.00,
      timeline: "8-10 Weeks",
      description: "Advanced storefront with full dashboard and real-time carrier automations.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 2,
      status: Status.ACTIVE,
      features: ["Everything in Standard", "Full Payment Webhooks", "Shiprocket Full Auto Pickup", "Advanced Variant & Search Filter"],
    },
    {
      id: "ecom-nocode",
      serviceId: "ecommerce-dev",
      name: "No-Code E-Commerce",
      price: 30000.00,
      timeline: "1-2 Weeks",
      description: "No-Code storefront setup. Includes Basic SEO and Website Content.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 3,
      status: Status.ACTIVE,
      features: ["Basic SEO", "Website Content"],
    },
    // Branding Packages
    {
      id: "brand-logo",
      serviceId: "branding",
      name: "Logo Design",
      price: 4999.00,
      timeline: "1 Week",
      description: "Creative logo assets and graphics drafts.",
      isRecommended: false,
      isPopular: false,
      displayOrder: 0,
      status: Status.ACTIVE,
      features: ["3 Logo Draft Concepts", "Vector Output Deliverables"],
    },
    {
      id: "brand-guidelines",
      serviceId: "branding",
      name: "Brand Guidelines",
      price: 9999.00,
      timeline: "2 Weeks",
      description: "Complete visual identity stylebook.",
      isRecommended: true,
      isPopular: true,
      displayOrder: 1,
      status: Status.ACTIVE,
      features: ["Color Palette", "Typography Stylebook", "Logo Usage Rules"],
    },
  ];

  for (const p of packagesData) {
    const pkg = await prisma.package.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        price: p.price,
        timeline: p.timeline,
        description: p.description,
        isRecommended: p.isRecommended,
        isPopular: p.isPopular,
        displayOrder: p.displayOrder,
        status: p.status,
      },
      create: {
        id: p.id,
        serviceId: p.serviceId,
        name: p.name,
        price: p.price,
        timeline: p.timeline,
        description: p.description,
        isRecommended: p.isRecommended,
        isPopular: p.isPopular,
        displayOrder: p.displayOrder,
        status: p.status,
      },
    });

    // Delete existing features for this package to avoid duplicates
    await prisma.packageFeature.deleteMany({
      where: { packageId: pkg.id },
    });

    // Insert features
    for (const feat of p.features) {
      await prisma.packageFeature.create({
        data: {
          packageId: pkg.id,
          feature: feat,
        },
      });
    }
  }
  console.log(`✅ Service Packages and Features seeded.`);

  // 6. Seed Pricing Components
  const pricingComponentsData = [
    // Website Dev components
    { id: "website-amc", serviceId: "website-dev", name: "Annual Maintenance Contract (AMC)", pricingType: PricingType.FIXED, price: 2000.00, description: "Includes core updates, security patches and optimizations", maxQuantity: 1, iconName: "Shield", status: Status.ACTIVE, category: "Standard Add-ons", billingCycle: BillingCycle.ONE_TIME },
    { id: "website-whatsapp", serviceId: "website-dev", name: "WhatsApp Integration Support", pricingType: PricingType.FIXED, price: 1999.00, description: "Direct customer contact chat widgets setup", maxQuantity: 1, iconName: "MessageCircle", status: Status.ACTIVE, category: "Standard Add-ons", billingCycle: BillingCycle.ONE_TIME },
    { id: "website-blogs", serviceId: "website-dev", name: "Dynamic Blog System Setup", pricingType: PricingType.FIXED, price: 4999.00, description: "Publish content updates and articles", maxQuantity: 1, iconName: "FileText", status: Status.ACTIVE, category: "Standard Add-ons", billingCycle: BillingCycle.ONE_TIME },
    // Marketing components
    { id: "marketing-meta-ads", serviceId: "digital-marketing", name: "Meta Ads", pricingType: PricingType.FIXED, price: 8000.00, description: "One-time campaign setup.", status: Status.ACTIVE, category: "Marketing Services", billingCycle: BillingCycle.ONE_TIME, note: "Meta Ads is a one-time campaign setup. If you require Meta Ads again in the future, this service must be purchased again." },
    { id: "marketing-social-media", serviceId: "digital-marketing", name: "Social Media Handling", pricingType: PricingType.FIXED, price: 3000.00, description: "Social Media Handling monthly service.", status: Status.ACTIVE, category: "Marketing Services", billingCycle: BillingCycle.MONTHLY },
    { id: "marketing-reel-shoot", serviceId: "digital-marketing", name: "Reel Video Shoot", pricingType: PricingType.FIXED, price: 12000.00, description: "One-Time Reel Video Shoot service.", status: Status.ACTIVE, category: "Content Creation Services", billingCycle: BillingCycle.ONE_TIME },
    { id: "marketing-reel-edit", serviceId: "digital-marketing", name: "30-Second Reel Edit", pricingType: PricingType.FIXED, price: 999.00, description: "One-Time 30-Second Reel Edit service.", status: Status.ACTIVE, category: "Content Creation Services", billingCycle: BillingCycle.ONE_TIME },
  ];

  for (const c of pricingComponentsData) {
    await prisma.pricingComponent.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        pricingType: c.pricingType,
        price: c.price,
        description: c.description,
        maxQuantity: c.maxQuantity,
        iconName: c.iconName,
        status: c.status,
        category: c.category,
        billingCycle: c.billingCycle,
        note: c.note,
      },
      create: c,
    });
  }
  console.log(`✅ Service Pricing Components seeded.`);

  // 7. Seed Dynamic Questions & Options
  // Extra pages question for website packages
  const packagesList = ["web-std-no-domain", "web-std-with-domain", "web-dyn"];
  for (const pkgId of packagesList) {
    const priceMod = pkgId === "web-dyn" ? 3500.00 : 2500.00;
    const qId = `extra-pages-${pkgId}`;
    await prisma.question.upsert({
      where: { id: qId },
      update: {
        text: "Extra Pages Needed",
        type: QuestionType.COUNTER,
        isRequired: false,
        displayOrder: 0,
        defaultValue: 0,
        priceModifier: priceMod,
        modifierType: ModifierType.FLAT,
      },
      create: {
        id: qId,
        packageId: pkgId,
        text: "Extra Pages Needed",
        type: QuestionType.COUNTER,
        isRequired: false,
        displayOrder: 0,
        defaultValue: 0,
        priceModifier: priceMod,
        modifierType: ModifierType.FLAT,
      },
    });
  }

  // Custom Requirements question for branding
  await prisma.question.upsert({
    where: { id: "custom-requirements" },
    update: {
      text: "Other Custom Requirements",
      description: "Specify any custom design assets (e.g. menu design, billboard, standee, etc.)",
      type: QuestionType.TEXT,
      isRequired: false,
      displayOrder: 10,
      defaultValue: "",
      priceModifier: 0.00,
      modifierType: ModifierType.FLAT,
    },
    create: {
      id: "custom-requirements",
      serviceId: "branding",
      text: "Other Custom Requirements",
      description: "Specify any custom design assets (e.g. menu design, billboard, standee, etc.)",
      type: QuestionType.TEXT,
      isRequired: false,
      displayOrder: 10,
      defaultValue: "",
      priceModifier: 0.00,
      modifierType: ModifierType.FLAT,
    },
  });

  console.log(`✅ Dynamic Questions seeded.`);
  console.log("🌱 Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("💥 Seeding encountered an error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
