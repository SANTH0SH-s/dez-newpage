# Dezprox Solutions - Backend Architecture & Planning Document

This document outlines the proposed backend architecture, database schema, API structure, authentication flows, data flows, and environment configurations for the **Dezprox Estimator and Management System (EMS)**.

---

## 1. Database Architecture & Schema

To support the rich features of the Dezprox Estimator (dynamic services, packages, questions, conditional logic, pricing components, and admin controls), a relational database schema (e.g., **PostgreSQL**) is highly recommended due to the strong relationships and integrity constraints between services, packages, questions, and submitted leads.

### Entity Relationship Diagram (Conceptual)
```
  [GlobalSettings]
  
  [Service] 1 ------ * [Package]
     1                  1
     |                  |
     *                  *
  [Question] <--------- [QuestionOption] (Self-referencing conditional logic)
     1
     |
     *
  [PricingComponent]
  
  [Enquiry] 1 ------ 1 [Estimate]
```

### Database Tables & Schema Definition

#### `global_settings`
Stores configuration options used by the estimator engine.
*   `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
*   `company_name`: `VARCHAR(100)` (Not Null, Default: 'Dezprox Solutions')
*   `currency`: `VARCHAR(10)` (Not Null, Default: '₹')
*   `tax_rate`: `NUMERIC(5,2)` (Not Null, Default: 18.00)
*   `discount_rate`: `NUMERIC(5,2)` (Not Null, Default: 0.00)
*   `minimum_cost`: `NUMERIC(12,2)` (Not Null, Default: 500.00)
*   `maximum_cost`: `NUMERIC(12,2)` (Not Null, Default: 100000.00)
*   `whatsapp_number`: `VARCHAR(20)`
*   `gate_estimate_lead_form`: `BOOLEAN` (Not Null, Default: false)
*   `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `CURRENT_TIMESTAMP`)

#### `services`
Defines categories of offerings configured for the estimator.
*   `id`: `VARCHAR(50)` (Primary Key, e.g., 'website-dev')
*   `name`: `VARCHAR(100)` (Not Null)
*   `category`: `VARCHAR(100)` (Not Null)
*   `description`: `TEXT`
*   `icon_name`: `VARCHAR(50)`
*   `icon_image`: `TEXT` (URL/S3 Path)
*   `card_image`: `TEXT`
*   `hero_banner`: `TEXT`
*   `thumbnail`: `TEXT`
*   `base_price`: `NUMERIC(12,2)` (Not Null, Default: 0.00)
*   `unit_type`: `VARCHAR(30)` (Default: 'unit')
*   `status`: `VARCHAR(20)` (Not Null, Default: 'active' - values: 'active', 'inactive')
*   `display_order`: `INTEGER` (Not Null, Default: 0)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `CURRENT_TIMESTAMP`)
*   `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default: `CURRENT_TIMESTAMP`)

#### `packages`
Tiered service models (e.g. Bronze, Silver, Gold).
*   `id`: `VARCHAR(50)` (Primary Key, e.g., 'web-basic')
*   `service_id`: `VARCHAR(50)` (Foreign Key references `services.id` ON DELETE CASCADE)
*   `name`: `VARCHAR(100)` (Not Null)
*   `price`: `NUMERIC(12,2)` (Not Null, Default: 0.00)
*   `timeline`: `VARCHAR(50)` (e.g., '2-3 weeks')
*   `description`: `TEXT`
*   `is_recommended`: `BOOLEAN` (Default: false)
*   `is_popular`: `BOOLEAN` (Default: false)
*   `is_best_value`: `BOOLEAN` (Default: false)
*   `is_new`: `BOOLEAN` (Default: false)
*   `display_order`: `INTEGER` (Default: 0)
*   `status`: `VARCHAR(20)` (Default: 'active')
*   `features`: `TEXT[]` (Array of features/deliverables)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `CURRENT_TIMESTAMP`)

#### `questions`
Form components that drive service customizations.
*   `id`: `VARCHAR(50)` (Primary Key)
*   `service_id`: `VARCHAR(50)` (Foreign Key references `services.id` ON DELETE CASCADE)
*   `package_id`: `VARCHAR(50)` (Foreign Key references `packages.id` ON DELETE SET NULL, optional)
*   `text`: `TEXT` (Not Null)
*   `description`: `TEXT`
*   `type`: `VARCHAR(30)` (Not Null, e.g., 'radio', 'checkbox', 'select', 'counter', 'number', 'text', 'toggle')
*   `is_required`: `BOOLEAN` (Default: false)
*   `display_order`: `INTEGER` (Default: 0)
*   `default_value`: `JSONB` (Optional default input values)
*   `conditional_parent_id`: `VARCHAR(50)` (Self-reference key)
*   `conditional_parent_value`: `VARCHAR(100)` (Triggers visibility if parent has this value)
*   `min_value`: `NUMERIC(12,2)` (For number/counter validation)
*   `max_value`: `NUMERIC(12,2)` (For number/counter validation)
*   `validation_pattern`: `VARCHAR(255)` (Regex pattern)
*   `validation_message`: `VARCHAR(255)` (Regex failure message)

#### `question_options`
Multi-choice options for selection-based questions.
*   `id`: `UUID` (Primary Key)
*   `question_id`: `VARCHAR(50)` (Foreign Key references `questions.id` ON DELETE CASCADE)
*   `value`: `VARCHAR(100)` (Not Null)
*   `label`: `VARCHAR(255)` (Not Null)
*   `price_modifier`: `NUMERIC(12,2)` (Not Null, Default: 0.00)
*   `modifier_type`: `VARCHAR(20)` (Not Null, e.g., 'flat', 'multiplier')
*   `description`: `TEXT`

#### `pricing_components`
Individual add-ons or line items for estimation.
*   `id`: `VARCHAR(50)` (Primary Key)
*   `service_id`: `VARCHAR(50)` (Foreign Key references `services.id` ON DELETE CASCADE)
*   `name`: `VARCHAR(100)` (Not Null)
*   `type`: `VARCHAR(30)` (Not Null, e.g., 'fixed', 'per-unit')
*   `fixed_price`: `NUMERIC(12,2)` (Default: 0.00)
*   `per_unit_price`: `NUMERIC(12,2)` (Default: 0.00)
*   `description`: `TEXT`
*   `max_quantity`: `INTEGER`
*   `status`: `VARCHAR(20)` (Default: 'active')
*   `category`: `VARCHAR(100)`
*   `billing_cycle`: `VARCHAR(30)` (Default: 'one-time' - values: 'one-time', 'monthly')
*   `note`: `TEXT`

#### `multipliers`
Stores complexity, urgency, and quality modifiers.
*   `id`: `VARCHAR(50)` (Primary Key)
*   `category`: `VARCHAR(30)` (Not Null, e.g., 'complexity', 'urgency', 'quality')
*   `label`: `VARCHAR(100)` (Not Null)
*   `value`: `NUMERIC(4,2)` (Not Null)
*   `description`: `TEXT`

#### `enquiries`
Submitted client lead and estimate record.
*   `id`: `VARCHAR(20)` (Primary Key, e.g., 'ENQ-1002')
*   `name`: `VARCHAR(100)` (Not Null)
*   `email`: `VARCHAR(100)` (Not Null)
*   `phone`: `VARCHAR(20)` (Not Null)
*   `company`: `VARCHAR(150)`
*   `message`: `TEXT`
*   `selected_services`: `VARCHAR(50)[]` (Array of selected service IDs)
*   `estimate_range`: `VARCHAR(100)`
*   `total_price`: `NUMERIC(12,2)`
*   `answers`: `JSONB` (Saves complete configuration inputs of the customer)
*   `breakdown`: `JSONB` (Saves final price calculation object)
*   `status`: `VARCHAR(20)` (Default: 'pending' - values: 'pending', 'contacted', 'completed', 'archived')
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `CURRENT_TIMESTAMP`)

#### `users`
Administrators authorized to access the dashboard.
*   `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
*   `name`: `VARCHAR(100)` (Not Null)
*   `email`: `VARCHAR(100)` (Unique, Not Null)
*   `password_hash`: `VARCHAR(255)` (Not Null)
*   `role`: `VARCHAR(30)` (Default: 'ADMIN' - values: 'ADMIN', 'VIEWER')
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (Default: `CURRENT_TIMESTAMP`)

---

## 2. API Structure & Required Endpoints

The API will be built in REST format, returning JSON payloads. Endpoint access is divided into Public (Client) and Protected (Admin) routes.

### Public Client API Endpoints

| HTTP Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/services` | Fetches all active services with their packages, questions, options, and pricing components. | Query: None |
| **GET** | `/api/v1/multipliers` | Fetches active complexity, urgency, and quality modifiers. | Query: None |
| **GET** | `/api/v1/settings` | Fetches public estimator settings (currency, WhatsApp number, tax rate, etc.) | Query: None |
| **POST** | `/api/v1/estimates/calculate` | Calculates estimate price breakdown using backend logic to prevent client tampering. | `{ selectedServiceIds: [...], answers: {...}, multipliers: {...} }` |
| **POST** | `/api/v1/enquiries` | Creates a new enquiry/lead submission. Triggers calculation & persists record. | `{ name, email, phone, company, message, selectedServices, answers }` |

### Protected Admin API Endpoints

All admin endpoints require a valid Authorization Header: `Bearer <JWT_TOKEN>`.

#### Authentication / Account
*   **POST** `/api/v1/auth/login`: Signs in an admin, returns JWT token. Request: `{ email, password }`.
*   **POST** `/api/v1/auth/refresh`: Refreshes token validity.
*   **GET** `/api/v1/auth/me`: Retrieves current admin user details.

#### Estimator Configurations Management
*   **PUT** `/api/v1/admin/settings`: Updates global estimator settings.
*   **POST/PUT/DELETE** `/api/v1/admin/services`: CRUD operations on services.
*   **POST/PUT/DELETE** `/api/v1/admin/packages`: CRUD operations on packages.
*   **POST/PUT/DELETE** `/api/v1/admin/questions`: CRUD operations on service questions and options.
*   **POST/PUT/DELETE** `/api/v1/admin/pricing-components`: CRUD operations on add-on items.
*   **PUT** `/api/v1/admin/multipliers`: Updates complexity, urgency, and quality coefficient values.

#### Lead & Enquiry Management
*   **GET** `/api/v1/admin/enquiries`: Paginated, filtered list of leads and submitted enquiries. Query parameters: `page`, `limit`, `status`, `search`.
*   **GET** `/api/v1/admin/enquiries/:id`: Retrieve full lead details, answers history, and pricing breakdown.
*   **PATCH** `/api/v1/admin/enquiries/:id/status`: Updates lead tracking status (`contacted`, `completed`, `archived`). Request: `{ status }`.
*   **DELETE** `/api/v1/admin/enquiries/:id`: Permanently deletes an enquiry (limited to Root Admin).

---

## 3. Backend Application Architecture

A **Layered Architecture (Clean/MVC variant)** is proposed to achieve modularity, testability, and easy updates.

```
+-------------------------------------------------------------+
|                       HTTP Request                          |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Routing & Middleware                    |
|       (Authentication, Validation, CORS, Rate Limiting)      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                         Controllers                         |
|     (Deserializes parameters, binds routes, returns HTTP)   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                        Service Layer                        |
|   (Core Business logic: pricing calculator, emails, JWT)    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                       Repository Layer                      |
|       (Data Access Object / ORM: Prisma or TypeORM)         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                          Database                           |
+-------------------------------------------------------------+
```

### Key Architectural Layers:
1.  **Controller Layer**: Handles HTTP requests, extracts parameters, handles response formatting, and forwards actions to the Service layer.
2.  **Service Layer**: Houses the core logic. This includes the `PricingCalculatorService` (which computes the final totals matching the frontend algorithms but in a secure env), `EmailService` (notification delivery), and `AuthService` (user management).
3.  **Repository/Data Access Layer (DAL)**: Abstracts queries using a database client (e.g., **Prisma ORM** or **TypeORM**). Ensures schema migrations are managed cleanly.
4.  **Middleware**:
    *   `authMiddleware`: Validates JWT claims.
    *   `validationMiddleware`: Validates requests before reaching controllers (using **Zod** schema validations).
    *   `rateLimiter`: Limits calls to public endpoint groups (especially `/enquiries` and `/estimates/calculate`) to protect against DDoS.

---

## 4. Authentication & Authorization Flow

### Authentication Process
1.  Admin attempts login by submitting credentials via `POST /api/v1/auth/login`.
2.  Backend fetches user by email. Compares request password with storage hash using **bcrypt**.
3.  If valid, backend generates a high-entropy JWT containing:
    *   `sub`: User ID
    *   `email`: User Email
    *   `role`: Authorization level (`ADMIN`, `VIEWER`)
    *   `exp`: Expiration epoch (typically 1 hour for access, 7 days for refresh token).
4.  Admin Client stores access token in memory (or secure HTTP-only cookie) and issues it in the `Authorization: Bearer <token>` header of every subsequent admin call.

### Authorization Model (RBAC)
Role-Based Access Control (RBAC) is implemented via route decorations or middleware guards:
*   `VIEWER`: Read-only access to `/admin/enquiries` and settings. Can view stats but cannot alter services, change questions, update pricing details, or edit global settings.
*   `ADMIN`: Write/Modify permissions across all settings, service components, pricing options, and status toggles.

---

## 5. Data Flow Diagram

```
[Customer Frontend]                        [Backend Server]                    [PostgreSQL DB]
         |                                         |                                  |
         |----- 1. Submit Enquiry Form ----------->|                                  |
         |      (Services, Answers, Info)          |                                  |
         |                                         |----- 2. Retrieve config details->|
         |                                         |<---- 3. Active service schema ---|
         |                                         |                                  |
         |                                         |-- 4. Calculate Final Prices -----|
         |                                         |      (Calculate base, modifiers, |
         |                                         |       taxes, ranges)             |
         |                                         |                                  |
         |                                         |----- 5. Write Enquiry/Estimate ->|
         |                                         |                                  |
         |                                         |----- 6. Trigger Notifications -->|
         |                                         |      (WhatsApp hook / email)     |
         |                                         |                                  |
         |<---- 7. Return success & pricing -------|                                  |
```

### Steps:
1.  **Form Submission**: The user fills estimator details on the client and hits submit.
2.  **Config Fetching**: Backend queries the database for service blueprints and coefficients.
3.  **Secure Calculation**: Backend processes the selected options to determine exact flat rates and multiplier offsets, calculating final price, tax, and price range.
4.  **Persistence**: The enquiry record is saved in `enquiries` table with status `pending`.
5.  **Notifications**: Backend sends confirmation notifications (e.g., SMTP emails to admin and user, and Optional WhatsApp webhook trigger).
6.  **Response**: Frontend receives response and renders the summary dashboard.

---

## 6. Environment & Deployment Requirements

### Application Server Requirements
*   **Runtime Environment**: Node.js (v18.x or v20.x LTS)
*   **Process Manager**: PM2 (for clustering and keeping application running) or Docker containerization.

### Base Environment Variables (`.env` template)
```ini
# Application configuration
PORT=4000
NODE_ENV=production
API_PREFIX=/api/v1
CORS_ORIGIN=https://your-frontend-domain.com

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database_name?schema=public"

# JWT Authentication Configuration
JWT_SECRET="generate-high-entropy-random-string-here"
JWT_ACCESS_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# SMTP Email Configuration
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="username"
SMTP_PASS="password"
SMTP_FROM="no-reply@dezprox.solutions"

# WhatsApp integration
WHATSAPP_API_TOKEN="whatsapp-cloud-api-token"
WHATSAPP_PHONE_NUMBER_ID="whatsapp-sender-id"
```

### Containerization (Dockerfile)
To facilitate seamless deployment across cloud systems (AWS, GCP, DigitalOcean):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
```
