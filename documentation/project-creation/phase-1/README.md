# Phase 1: Core Backend — Data Models & Database Layer

## Overview
This phase implements all Mongoose schemas and establishes the data layer for the Track It system.

**Total Stories:** 7  
**Estimated Effort:** ~20 hours  
**Status:** Not Started  
**Prerequisites:** Phase 0 must be completed

---

## Stories

### Story 1.1-001: Implement Company Mongoose Schema
**Priority:** Critical | **Effort:** 2 hours | **Dependencies:** 0.3-001  
Create the Company model with Mongoose schema, validation, and indexes.

**Key Tasks:**
- Create `src/companies/schemas/company.schema.ts`
- Define schema: name, logo, nit, createdAt, updatedAt
- Add validation: unique NIT, required fields
- Create indexes: NIT (unique)
- Create TypeScript interfaces

**Acceptance Criteria:**
- NIT uniqueness is enforced
- Timestamps are auto-generated
- Indexes are created on database

---

### Story 1.2-001: Implement User Mongoose Schema
**Priority:** Critical | **Effort:** 3 hours | **Dependencies:** 0.3-001, 1.1-001  
Create the User model with authentication fields, role management, and proper validation.

**Key Tasks:**
- Create `src/users/schemas/user.schema.ts`
- Create Role enum: MasterAdmin, CompanyAdmin, Employer, Reseller
- Add validation: unique email/username, password requirements
- Create indexes: email (unique), username (unique), companyId
- Add pre-save hook for password hashing
- Add method to compare passwords

**Acceptance Criteria:**
- Schema enforces email and username uniqueness
- Passwords are hashed before saving (bcrypt, 10 rounds)
- Role enum validates allowed values
- Password comparison method works correctly

---

### Story 1.3-001: Implement Category Mongoose Schema
**Priority:** High | **Effort:** 2 hours | **Dependencies:** 0.3-001, 1.1-001  
Create the Category model for organizing inventory items.

**Key Tasks:**
- Create `src/categories/schemas/category.schema.ts`
- Define schema: name, companyId, createdAt, updatedAt
- Create compound index: (companyId + name) unique
- Add reference to Company model

**Acceptance Criteria:**
- Schema enforces unique category names per company
- Company reference works correctly
- Compound index is created

---

### Story 1.4-001: Implement Inventory Mongoose Schema
**Priority:** Critical | **Effort:** 3 hours | **Dependencies:** 1.1-001, 1.2-001, 1.3-001  
Create the Inventory model with support for company and reseller inventories.

**Key Tasks:**
- Create `src/inventories/schemas/inventory.schema.ts`
- Define schema: name, companyId, resellerId, isResellerInventory, categories, whitelist
- Add validation: resellerId required if isResellerInventory is true
- Create indexes: companyId, resellerId, isResellerInventory
- Add references to Company, User (reseller), and Category models
- Create virtual for whitelist user details

**Acceptance Criteria:**
- Schema validates reseller inventory rules
- Whitelist stores array of user IDs
- References populate correctly

---

### Story 1.5-001: Implement Item Mongoose Schema
**Priority:** Critical | **Effort:** 3 hours | **Dependencies:** 1.3-001, 1.4-001  
Create the Item model with global serial number uniqueness.

**Key Tasks:**
- Create `src/items/schemas/item.schema.ts`
- Define schema: name, brand, serial, price, retailPrice, inventoryId, categories
- Add validation: unique serial (globally), required fields, price validation
- Create indexes: serial (unique), inventoryId, categories
- Add pre-save hook to validate serial uniqueness

**Acceptance Criteria:**
- Serial number uniqueness is enforced globally
- Prices are validated as positive numbers
- Inventory reference works correctly
- Categories array can store multiple category IDs

---

### Story 1.6-001: Implement OrderRequest Mongoose Schema
**Priority:** Critical | **Effort:** 4 hours | **Dependencies:** 1.2-001, 1.4-001, 1.5-001  
Create the OrderRequest model supporting both standard and devolution orders.

**Key Tasks:**
- Create `src/orders/schemas/order-request.schema.ts`
- Define schema with orderType, status, source/target inventories
- Create enums: OrderType (Standard, Devolution), OrderStatus (Pending, Approved, Rejected)
- Add validation: status transitions, required fields per order type
- Create indexes: companyId, creator, status, sourceInventoryId, targetInventoryId, createdAt
- Add methods: canApprove(), canReject(), isExpired()

**Acceptance Criteria:**
- OrderType enum distinguishes standard vs devolution orders
- Status enum enforces valid order states
- References populate correctly
- Items array stores item IDs

---

### Story 1.7-001: Implement Audit Mongoose Schema
**Priority:** High | **Effort:** 3 hours | **Dependencies:** 1.2-001  
Create the Audit model for comprehensive activity logging.

**Key Tasks:**
- Create `src/audits/schemas/audit.schema.ts`
- Define schema: entityType, entityId, action, actor, description, metadata
- Create enums: EntityType, AuditAction (Create, Update, Delete, Deactivate, Approve, Reject, Move)
- Add validation: required fields, enum values
- Create indexes: entityType, entityId, actor, createdAt
- Add metadata as flexible JSON field

**Acceptance Criteria:**
- Schema supports all entity types
- All audit actions are represented in enum
- Metadata field accepts any JSON structure
- Indexes optimize audit queries
- Actor reference works correctly

---

## Progress Tracking

| Story ID | Title | Status | Assignee | Progress |
|----------|-------|--------|----------|----------|
| 1.1-001 | Company Schema | Not Started | TBD | 0% |
| 1.2-001 | User Schema | Not Started | TBD | 0% |
| 1.3-001 | Category Schema | Not Started | TBD | 0% |
| 1.4-001 | Inventory Schema | Not Started | TBD | 0% |
| 1.5-001 | Item Schema | Not Started | TBD | 0% |
| 1.6-001 | OrderRequest Schema | Not Started | TBD | 0% |
| 1.7-001 | Audit Schema | Not Started | TBD | 0% |

---

## Dependencies Graph

```
0.3-001 (MongoDB) ──→ 1.1-001 (Company) ──┬──→ 1.3-001 (Category) ──┬──→ 1.4-001 (Inventory) ──┬──→ 1.5-001 (Item) ──┬──→ 1.6-001 (OrderRequest)
                                          │                          │                          │                      │
                                          └──→ 1.2-001 (User) ───────┴──────────────────────────┴──────────────────────┴──→ 1.7-001 (Audit)
```

---

## Definition of Done

For Phase 1 to be considered complete:
- [ ] All 7 schemas are implemented and tested
- [ ] All schemas compile without TypeScript errors
- [ ] All indexes are created in MongoDB
- [ ] All validation rules are enforced
- [ ] Schema relationships (references) work correctly
- [ ] Pre-save hooks function as expected
- [ ] TypeScript interfaces are exported
- [ ] Schema documentation is complete

---

## Notes
- All schemas must use timestamps plugin for createdAt/updatedAt
- Use Mongoose virtuals for computed properties
- Indexes are critical for query performance
- Test schemas with actual MongoDB instance before proceeding to Phase 2
