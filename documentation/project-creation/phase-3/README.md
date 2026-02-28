# Phase 3: Core Backend — Business Logic Services

## Overview
This phase implements core business logic services for the Track It system.

**Total Stories:** 7  
**Estimated Effort:** ~39 hours  
**Status:** Not Started  
**Prerequisites:** Phases 0, 1, and 2 must be completed

---

## Stories

### Story 3.1-001: Implement Company Service
**Priority:** High | **Effort:** 5 hours | **Dependencies:** 1.1-001, 2.4-001  
Create company management service with CRUD operations.

**Key Methods:**
- createCompany() (Master Admin only)
- getCompanyById()
- getAllCompanies() with pagination
- updateCompany()
- uploadLogo() placeholder
- getCompanyUsers()

**Acceptance Criteria:**
- NIT uniqueness is enforced
- Pagination works (default 10, options: 5, 10, 20, 25)
- Authorization prevents unauthorized access
- Unit tests cover all methods

---

### Story 3.2-001: Implement User Service
**Priority:** Critical | **Effort:** 6 hours | **Dependencies:** 1.2-001, 2.4-001, 3.1-001  
Create user management service with role-based operations.

**Key Methods:**
- createUser() with role assignment validation
- getUserById()
- getUsersByCompany() with pagination
- updateUser()
- deactivateUser() (soft delete)
- validateUserPermissions()
- checkRoleHierarchy()

**Acceptance Criteria:**
- Employers can only create Resellers
- Company Admins cannot create Master Admins
- Deactivation sets isActive to false
- Role hierarchy is enforced
- Unit tests cover all methods

---

### Story 3.3-001: Implement Category Service
**Priority:** Medium | **Effort:** 3 hours | **Dependencies:** 1.3-001, 2.4-001  
Create category management service for inventory organization.

**Key Methods:**
- createCategory() (Company Admin/Employer)
- getCategoriesByCompany()
- updateCategory()
- deleteCategory() with usage check
- checkCategoryUsage()

**Acceptance Criteria:**
- Categories are unique per company
- Cannot delete categories that are in use
- Only Company Admin and Employer can create categories
- Unit tests cover all methods

---

### Story 3.4-001: Implement Inventory Service
**Priority:** Critical | **Effort:** 6 hours | **Dependencies:** 1.4-001, 2.4-001, 3.2-001  
Create inventory management service with whitelist control.

**Key Methods:**
- createInventory()
- getInventoryById() with access control
- getInventoriesByCompany() with pagination
- getResellerInventories()
- updateInventory()
- deleteInventory() (must be empty)
- addResellerToWhitelist()
- removeResellerFromWhitelist()
- checkInventoryAccess()

**Acceptance Criteria:**
- Resellers can only see whitelisted inventories
- Whitelist only accepts reseller user IDs
- Cannot delete inventory with items
- Access control enforces company boundaries
- Unit tests cover all methods

---

### Story 3.5-001: Implement Item Service
**Priority:** Critical | **Effort:** 6 hours | **Dependencies:** 1.5-001, 2.4-001, 3.4-001  
Create item management service with serial number validation.

**Key Methods:**
- addItem() with serial uniqueness check
- getItemById()
- getItemsByInventory() with pagination and category filter
- updateItem()
- deleteItem()
- validateSerialUniqueness()
- moveItemBetweenInventories() (internal)

**Acceptance Criteria:**
- Serial numbers are globally unique
- Items can be filtered by category
- moveItemBetweenInventories() updates inventoryId correctly
- Prices are positive numbers
- Unit tests cover all methods

---

### Story 3.6-001: Implement Order Request Service
**Priority:** Critical | **Effort:** 8 hours | **Dependencies:** 1.6-001, 2.4-001, 3.4-001, 3.5-001  
Create order request service handling standard and devolution orders with approval workflow.

**Key Methods:**
- createStandardOrder() (reseller → company)
- createDevolutionOrder() (reseller → company)
- getOrderById()
- getOrdersByCompany() with pagination and filters
- getOrdersByReseller() with pagination
- approveOrder() with item transfer logic
- rejectOrder() with reason validation
- validateOrderItems()
- executeItemTransfer()

**Acceptance Criteria:**
- Standard orders move items from company to reseller inventory
- Devolution orders move items from reseller to company inventory
- Order approval is atomic (all items or none)
- Rejection requires a reason
- Orders can be filtered by status
- Concurrent approvals are handled correctly
- Unit tests cover all scenarios

---

### Story 3.7-001: Implement Audit Service
**Priority:** High | **Effort:** 5 hours | **Dependencies:** 1.7-001, 2.4-001  
Create audit logging service with automatic activity tracking.

**Key Methods:**
- createAuditRecord()
- getAuditsByEntity() with pagination
- getAuditsByActor() with pagination
- getAuditsByCompany() with pagination
- getItemAuditTrail() with timeline
- Audit interceptor for automatic logging
- Filtering by date range, action type

**Acceptance Criteria:**
- Audit records are created for all significant actions
- Audit interceptor captures user actions automatically
- Audit trail shows complete item history
- Pagination and filtering work correctly
- Metadata field stores contextual information
- Unit tests cover all methods

---

## Progress Tracking

| Story ID | Title | Status | Assignee | Progress |
|----------|-------|--------|----------|----------|
| 3.1-001 | Company Service | Not Started | TBD | 0% |
| 3.2-001 | User Service | Not Started | TBD | 0% |
| 3.3-001 | Category Service | Not Started | TBD | 0% |
| 3.4-001 | Inventory Service | Not Started | TBD | 0% |
| 3.5-001 | Item Service | Not Started | TBD | 0% |
| 3.6-001 | Order Request Service | Not Started | TBD | 0% |
| 3.7-001 | Audit Service | Not Started | TBD | 0% |

---

## Dependencies Graph

```
2.4-001 (Guards) ──┬──→ 3.1-001 (Company) ──→ 3.2-001 (User) ──┬──→ 3.4-001 (Inventory) ──┬──→ 3.5-001 (Item) ──┬──→ 3.6-001 (OrderRequest)
                   │                                            │                          │                      │
                   └──→ 3.3-001 (Category) ────────────────────┴──────────────────────────┘                      │
                   │                                                                                               │
                   └──→ 3.7-001 (Audit) ────────────────────────────────────────────────────────────────────────┘
```

---

## Definition of Done

For Phase 3 to be considered complete:
- [ ] All 7 services are implemented and tested
- [ ] All CRUD operations work correctly
- [ ] Authorization is enforced in all service methods
- [ ] Pagination works consistently across services
- [ ] Business rules are enforced (role hierarchy, permissions, etc.)
- [ ] Transaction support for critical operations (order approval)
- [ ] Audit logging captures all significant actions
- [ ] Error handling is consistent and informative
- [ ] Unit tests pass with >80% coverage

---

## Business Logic Highlights

### Role Hierarchy
- Master Admin > Company Admin > Employer > Reseller
- Employers cannot create other Employers or Admins
- Company Admins cannot create Master Admins

### Order Approval Flow
1. Reseller creates order (standard or devolution)
2. Company Admin/Employer reviews order
3. On approval: Items move atomically, audit created, email sent
4. On rejection: Reason required, audit created, email sent

### Audit Requirements
Create audit records for:
- User actions: create, modify, deactivate
- Inventory actions: create, modify, delete items
- Order actions: create, approve, reject
- Item movements between inventories

---

## Notes
- Use transactions for order approval to ensure atomicity
- All services should validate authorization before operations
- Services should throw descriptive errors for business rule violations
- Consider implementing soft deletes for entities that need history
- Mock dependencies in unit tests for isolation
