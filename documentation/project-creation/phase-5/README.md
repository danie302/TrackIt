# Phase 5: Core Backend — API Endpoints

## Overview
Expose RESTful API endpoints for all business operations following the `/api/v1/*` versioning pattern.

**Total Stories:** 9  
**Estimated Effort:** ~30 hours  
**Status:** Not Started  
**Prerequisites:** Phases 0-3 must be completed

---

## Stories

### Story 5.1-001: Health & System Endpoints
**Priority:** Critical | **Effort:** 2 hours | **Dependencies:** 0.3-001, 0.3-002  
Create health check endpoints for monitoring system status.

**Endpoints:**
- GET /health
- GET /api/v1/health

**Acceptance Criteria:**
- Returns database connection status
- Returns Redis connection status
- Returns 200 if all systems healthy, 503 if any system down

---

### Story 5.2-001: Company API Endpoints
**Priority:** High | **Effort:** 4 hours | **Dependencies:** 3.1-001  
Create REST API endpoints for company management.

**Endpoints:**
- POST /api/v1/companies
- GET /api/v1/companies
- GET /api/v1/companies/:id
- PUT /api/v1/companies/:id
- POST /api/v1/companies/:id/logo
- GET /api/v1/companies/:id/users

---

### Story 5.3-001: User API Endpoints
**Priority:** Critical | **Effort:** 4 hours | **Dependencies:** 3.2-001  
Create REST API endpoints for user management.

**Endpoints:**
- POST /api/v1/users
- GET /api/v1/users
- GET /api/v1/users/:id
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id (deactivate)

---

### Story 5.4-001: Category API Endpoints
**Priority:** Medium | **Effort:** 3 hours | **Dependencies:** 3.3-001  
Create REST API endpoints for category management.

**Endpoints:**
- POST /api/v1/categories
- GET /api/v1/categories
- GET /api/v1/categories/:id
- PUT /api/v1/categories/:id
- DELETE /api/v1/categories/:id

---

### Story 5.5-001: Inventory API Endpoints
**Priority:** Critical | **Effort:** 5 hours | **Dependencies:** 3.4-001  
Create REST API endpoints for inventory management.

**Endpoints:**
- POST /api/v1/inventories
- GET /api/v1/inventories
- GET /api/v1/inventories/:id
- PUT /api/v1/inventories/:id
- DELETE /api/v1/inventories/:id
- POST /api/v1/inventories/:id/whitelist
- DELETE /api/v1/inventories/:id/whitelist/:resellerId
- GET /api/v1/inventories/:id/items

---

### Story 5.6-001: Item API Endpoints
**Priority:** Critical | **Effort:** 4 hours | **Dependencies:** 3.5-001  
Create REST API endpoints for item management.

**Endpoints:**
- POST /api/v1/items
- GET /api/v1/items
- GET /api/v1/items/:id
- PUT /api/v1/items/:id
- DELETE /api/v1/items/:id

---

### Story 5.7-001: Order Request API Endpoints
**Priority:** Critical | **Effort:** 5 hours | **Dependencies:** 3.6-001  
Create REST API endpoints for order management.

**Endpoints:**
- POST /api/v1/orders (standard)
- POST /api/v1/orders/devolution
- GET /api/v1/orders
- GET /api/v1/orders/:id
- PUT /api/v1/orders/:id/approve
- PUT /api/v1/orders/:id/reject

---

### Story 5.8-001: Audit API Endpoints
**Priority:** High | **Effort:** 3 hours | **Dependencies:** 3.7-001  
Create REST API endpoints for audit trail viewing.

**Endpoints:**
- GET /api/v1/audits
- GET /api/v1/audits/entity/:entityType/:entityId
- GET /api/v1/audits/user/:userId
- GET /api/v1/items/:itemId/audit-trail

---

## Progress Tracking

| Story ID | Title | Status | Assignee | Progress |
|----------|-------|--------|----------|----------|
| 5.1-001 | Health Endpoints | Not Started | TBD | 0% |
| 5.2-001 | Company API | Not Started | TBD | 0% |
| 5.3-001 | User API | Not Started | TBD | 0% |
| 5.4-001 | Category API | Not Started | TBD | 0% |
| 5.5-001 | Inventory API | Not Started | TBD | 0% |
| 5.6-001 | Item API | Not Started | TBD | 0% |
| 5.7-001 | Order API | Not Started | TBD | 0% |
| 5.8-001 | Audit API | Not Started | TBD | 0% |

---

## Definition of Done
- [ ] All endpoints return correct HTTP status codes
- [ ] Request/response DTOs are defined
- [ ] Input validation is implemented
- [ ] Authorization guards are applied
- [ ] Pagination works consistently
- [ ] Error responses are formatted correctly
- [ ] Swagger documentation is generated
- [ ] Integration tests pass
