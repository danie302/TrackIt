# Track It — Project Requirements

## Overview

**Project name:** Track It

This document defines the technical stack, architecture, file structure, and functional requirements for the Track It project.

---

## 1. Tech Stack

### 1.1 Frontend

- **Vite** — project scaffolding and build tool
- **TypeScript**
- **React** — UI framework
- **Zustand** — state management
- **Material UI** — component library
- **Axios** — HTTP client
- **React Router** — routing
- **React Hook Form** — form handling
- **Jest** — testing

### 1.2 Backend

- **NestJS** — backend framework
- **TypeScript**
- **Auth.js** (https://authjs.dev/) — authentication
- **MongoDB** — database
- **Mongoose** — ODM
- **Redis** — caching for frequently accessed data (e.g. user sessions, frequently queried inventories)
- **Nodemailer** — email service for notifications (order status, password reset, etc.)
- **Jest** — unit and integration tests for backend services and business logic

### 1.3 Infrastructure

- **Docker** — containerization

### 1.4 Configuration and secrets

- **Environment variables** — URLs, API keys, and secrets are stored in `.env` files (per app or per environment). Do not commit `.env` to git.
- **`.env.example`** — Each project (frontend, backend) that uses env vars should have an `.env.example` file listing required variable names (without values). `.env.example` is committed to git and not excluded.

### 1.5 File storage

- **Local storage** — files (e.g. company logos) are stored in the container's local filesystem during development.
- **S3 bucket** — production deployment will use AWS S3 or compatible object storage for scalability and reliability.

### 1.6 API versioning

- All API endpoints are versioned using the pattern `/api/v1/*` to allow for future API changes without breaking existing clients.

### 1.7 Health check

- The backend exposes a **health endpoint** (e.g. `GET /health` or `GET /api/v1/health`) that checks connectivity to the database (and optionally Redis). This endpoint is used by Docker for container health checks and by load balancers for readiness probes.

---

## 2. File Structure

```
trackit/
├── frontend/
│   ├── React UI (Vite-generated structure)
│   └── Dockerfile
│
├── backend/
│   ├── NestJS backend structure
│   └── Dockerfile
│
├── docker/
│   ├── docker-compose files (dev, prod, test)
│   ├── README (description of files and scripts)
│   ├── scripts/
│   │   └── scripts to start containers and seed the DB
│   └── seed/
│       └── seed data scripts for the database (e.g. MongoDB)
│
└── documentation/
    ├── requirements.md          ← project requirements (this file)
    ├── stories/
    │   └── user stories for development
    ├── status/
    │   └── current status of each story
    └── MACRO_DEVELOPMENT_PLAN
        └── full project context for AI agent tracking
```

---

## 3. Document Index

| Location | Purpose |
|----------|---------|
| `documentation/requirements.md` | Project requirements |
| `documentation/stories/` | User stories for development |
| `documentation/status/` | Story status tracking |
| `documentation/MACRO_DEVELOPMENT_PLAN` | High-level project context for AI agents |

---

## 4. Functional Requirements

### 4.1 Product Purpose

Track It is an inventory system for companies to track items, move items to resellers, and audit every item movement.

---

### 4.2 User Roles and Permissions

#### Master Admin (system-wide)

- Review any user in the system
- Create new users and new companies
- Add, update, and delete permissions for users and companies
- Access a dedicated dashboard to visualize all of the above

#### Company Admin

- Acts as **company owner**.
- Create users within the company and assign roles with permissions.
- Permissions: create users for the company, create categories, create or delete inventories, update inventories, add items, approve or reject order requests, deactivate users.

#### Company Employer

- In charge of **updating and managing** company inventories.
- Can create **only resellers** for the company (cannot create Company Admins or other Employers).
- Permissions: create resellers, create categories, create inventories, update inventories, add items, approve or reject order requests. Cannot delete inventories or deactivate users.

#### Reseller

- In charge of **selling items** that the company provides them.
- Company role with access to whitelisted company inventories.
- Has their own inventory table.
- Permissions: check available (whitelisted) inventories, create order requests, create devolution order requests, update their own inventory.

#### Company structure

Each company has:

- **1 Company Admin** (owner)
- **Many Employers**
- **Many Resellers**

---

### 4.3 Business Rules

- A company **has** its own inventory and an audit system that tracks item movements and which users created, edited, or transferred each item.
- A company can have **multiple inventories**.
- **Company Admin** and **Employer** can create **categories** for company inventories and assign categories to items for filtering.
- Each company inventory is **private** and has a **whitelist** of resellers who can see it and request orders. Only Company Admin and Employer can add resellers to the whitelist.
- Each reseller has their **own inventory table**.
- A reseller selects **individual items** from a company inventory (no quantity field); they check the company inventory and add items one by one to the order request.
- A reseller may create a **request** to the company they are assigned to, to move the selected items from the company inventory **to** their own inventory.
- Order requests have three states only: **Pending** → **Approved** or **Rejected**. There is no partial approval; the entire order is approved or rejected.
- The project uses **email notifications** (e.g. when an order is approved or rejected, password reset).
- Users are **deactivated** rather than deleted; audits and history for deactivated users remain intact.
- Items can be **deleted** from inventories. Audit records preserve the history of deleted items.
- An **audit record** must be created for every significant user action: create user, modify user, deactivate user, create inventory, modify inventory, add items, modify items, delete items, create order requests, approve/reject order requests, item movements between inventories.

### 4.3.1 Security requirements

- **Password complexity**: Passwords must follow standard security practices:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password reset**: OTP tokens expire after 15 minutes.
- **Serial number uniqueness**: Each item's serial number must be globally unique across the entire system. No two items can have identical serial numbers.

### 4.3.2 List pagination

- All paginated lists (companies, users, inventories, items, order requests, audits, etc.) use a **default page size of 10 items**.
- The UI provides a **dropdown** to change the page size. Allowed values: **5**, **10**, **20**, **25** items per page.

---

### 4.4 Order Request Flow

#### 4.4.1 Standard Order (Company to Reseller)

1. **Reseller** checks the company inventory (whitelisted to them) and selects **individual items** (one unit per item; no quantity). They create an order request with those items.
2. **Company Admin or Employer** reviews the request. The order has three possible states: **Pending**, **Approved**, **Rejected**. There is no partial approval.
3. **Approved** → selected items are **moved** (transferred ownership) from the company inventory to the reseller's inventory. **Rejected** → rejection must include a reason. Email notifications are sent on approval/rejection.
4. Company has a screen to see all items that have **been moved** to reseller inventories and their status.

#### 4.4.2 Devolution Order (Reseller to Company)

1. **Reseller** selects items from their own inventory to return to the company.
2. **Reseller** creates a **devolution order request** specifying which items to return and the reason for return.
3. **Company Admin or Employer** reviews the devolution request. The devolution order has three possible states: **Pending**, **Approved**, **Rejected**. There is no partial approval.
4. **Approved** → selected items are **moved** back from the reseller's inventory to the company inventory. **Rejected** → rejection must include a reason. Email notifications are sent on approval/rejection.
5. Devolution orders are tracked separately in the audit system to maintain full item movement history.

---

### 4.5 Data Models

All entities include **created_at** and **updated_at** timestamps.

| Entity | Fields |
|--------|--------|
| **Company** | name, logo (file path), nit, created_at, updated_at |
| **User** | name, email, username, password, cel, dni, type of dni, **role**, **companyId**, **isActive**, created_at, updated_at |
| **Inventory** | name, companyId, resellerId (optional), isResellerInventory (boolean), categories (array), whitelist (array of reseller user ids), created_at, updated_at |
| **Item** | name, brand, serial (globally unique), price, retail price, inventoryId, categories (array), created_at, updated_at |
| **Category** | name, companyId, created_at, updated_at |
| **OrderRequest** | orderType (Standard \| Devolution), status (Pending \| Approved \| Rejected), creator (user id), companyId, sourceInventoryId, targetInventoryId, rejectionReason (optional), devolutionReason (optional), items (array of item ids), created_at, updated_at, approvedBy (user id, optional), approvedAt (timestamp, optional) |
| **Audit** | entityType (User \| Inventory \| Item \| OrderRequest \| Company), entityId, action (Create \| Update \| Delete \| Deactivate \| Approve \| Reject \| Move), actor (user id), description, metadata (JSON), created_at, updated_at |

**User model notes:**

- **companyId** links the user to a company. For Master Admin users, use a special company value (e.g. `"admin"`).
- **isActive**: when `false`, the user is deactivated (not deleted); they cannot log in and audits referencing them are preserved.

---

### 4.6 Screens

#### Authentication

- **Login**
- **Register**
- **Forgot password**  
  User enters email to receive an OTP to reset password (only if the account exists).

---

#### Master Admin

- **Master Admin dashboard**
  - List of companies and user count per company
  - Access to screen to create new companies
  - Click a company to open its detail screen
- **Master Admin — Create company**  
  Create a new company.
- **Master Admin — Company details**
  - View company details and list of users with roles
  - Create users, deactivate users (users are not deleted)
  - Roles cannot be modified after assignment

---

#### Company Admin

- **Company Admin dashboard** (tabbed)
  - Create new users for the company
  - List of inventories; create new inventories; click an inventory to open its detail page
  - List of company users; modify users; deactivate users
  - Click a reseller to open a detail page: items assigned to that reseller, date range filter, status
- **Company Admin — Inventory details**
  - View inventory items; add, modify, delete items
  - View inventory audits
  - Manage whitelist for that inventory
  - Review order requests (standard) for that inventory
  - Review devolution requests to return items to that inventory

---

#### Company Employer

- **Employer dashboard**  
  Same screens and functionality as Company Admin dashboard, **except**: no user creation, modification, or deactivation; can create only resellers (not other roles).

---

#### Reseller

- **Reseller dashboard**
  - Access to own inventory (items and audit history)
  - Link to company inventories the user has access to
  - Link to order requests screen
  - Link to devolution requests screen
- **Reseller — Company inventory details**  
  View company inventory (whitelisted to the user) and create an order request by selecting individual items from that inventory (no quantity; one unit per item).
- **Reseller — Own inventory (create devolution)**  
  View own inventory and create a devolution order request by selecting items to return to the company (no quantity; one unit per item) with a reason for return.
- **Reseller — Order requests**  
  View existing standard order requests and their status.
- **Reseller — Devolution requests**  
  View existing devolution order requests and their status.

---

### 4.7 Screen Summary (Reference)

| Actor | Screens |
|-------|---------|
| Any | Login, Register, Forgot password |
| Master Admin | Dashboard, Create company, Company details |
| Company Admin | Dashboard (users, inventories, users list, reseller details), Inventory details, Order requests (standard + devolution) |
| Employer | Dashboard (same as Company Admin minus user management), Inventory details, Order requests (standard + devolution) |
| Reseller | Dashboard, Company inventory details, Own inventory (create devolution), Order requests, Devolution requests |
