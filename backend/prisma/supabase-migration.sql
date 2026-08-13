-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'PER_UNIT');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('ONE_TIME', 'MONTHLY');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('RADIO', 'CHECKBOX', 'SELECT', 'COUNTER', 'NUMBER', 'TEXT', 'TOGGLE');

-- CreateEnum
CREATE TYPE "ModifierType" AS ENUM ('FLAT', 'MULTIPLIER');

-- CreateEnum
CREATE TYPE "MultiplierCategory" AS ENUM ('COMPLEXITY', 'URGENCY', 'QUALITY');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "AdminAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "iconImage" TEXT,
    "cardImage" TEXT,
    "heroBanner" TEXT,
    "thumbnail" TEXT,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "unitType" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQItem" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "timeline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isBestValue" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageFeature" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingComponent" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricingType" "PricingType" NOT NULL DEFAULT 'FIXED',
    "price" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "maxQuantity" INTEGER,
    "iconName" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'ONE_TIME',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "packageId" TEXT,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "type" "QuestionType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "defaultValue" JSONB,
    "priceModifier" DECIMAL(12,2) NOT NULL,
    "modifierType" "ModifierType" NOT NULL DEFAULT 'FLAT',
    "conditionalParentId" TEXT,
    "conditionalParentValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceModifier" DECIMAL(12,2) NOT NULL,
    "modifierType" "ModifierType" NOT NULL DEFAULT 'FLAT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationRule" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "pattern" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Multiplier" (
    "id" TEXT NOT NULL,
    "category" "MultiplierCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "value" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Multiplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerCompany" TEXT,
    "notes" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "taxRateSnapshot" DECIMAL(5,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "discountRateSnapshot" DECIMAL(5,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'Γé╣',
    "validUntil" TIMESTAMP(3),
    "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breakdown" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "estimateRange" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedEstimateService" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "baseCost" DECIMAL(12,2) NOT NULL,
    "addonsCost" DECIMAL(12,2) NOT NULL,
    "multiplierProduct" DECIMAL(5,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "estimatedTimeline" TEXT NOT NULL,

    CONSTRAINT "SelectedEstimateService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedPackage" (
    "id" TEXT NOT NULL,
    "selectedEstimateServiceId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "timeline" TEXT NOT NULL,

    CONSTRAINT "SelectedPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedEstimateAddon" (
    "id" TEXT NOT NULL,
    "selectedEstimateServiceId" TEXT NOT NULL,
    "pricingComponentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricingType" "PricingType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'ONE_TIME',

    CONSTRAINT "SelectedEstimateAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "estimateRange" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "selectedServices" TEXT[],

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'Γé╣',
    "taxRate" DECIMAL(5,2) NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL,
    "defaultPricingMode" TEXT NOT NULL,
    "minimumCost" DECIMAL(12,2) NOT NULL,
    "maximumCost" DECIMAL(12,2) NOT NULL,
    "whatsappNumber" TEXT,
    "gateEstimateWithLeadForm" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "adminAccountId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_email_key" ON "AdminAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_value_key" ON "QuestionOption"("questionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationRule_questionId_key" ON "ValidationRule"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_enquiryId_key" ON "Estimate"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedPackage_selectedEstimateServiceId_key" ON "SelectedPackage"("selectedEstimateServiceId");

-- AddForeignKey
ALTER TABLE "FAQItem" ADD CONSTRAINT "FAQItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageFeature" ADD CONSTRAINT "PackageFeature_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingComponent" ADD CONSTRAINT "PricingComponent_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationRule" ADD CONSTRAINT "ValidationRule_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedEstimateService" ADD CONSTRAINT "SelectedEstimateService_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedPackage" ADD CONSTRAINT "SelectedPackage_selectedEstimateServiceId_fkey" FOREIGN KEY ("selectedEstimateServiceId") REFERENCES "SelectedEstimateService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedEstimateAddon" ADD CONSTRAINT "SelectedEstimateAddon_selectedEstimateServiceId_fkey" FOREIGN KEY ("selectedEstimateServiceId") REFERENCES "SelectedEstimateService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminAccountId_fkey" FOREIGN KEY ("adminAccountId") REFERENCES "AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

