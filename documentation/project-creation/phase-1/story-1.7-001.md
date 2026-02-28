# Story 1.7-001: Implement Audit Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** High
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 1.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the Audit model for comprehensive activity logging to track all significant user actions and system events.

## Tasks
1. Create `backend/src/audits/schemas/audit.schema.ts`
2. Create EntityType enum: User, Inventory, Item, OrderRequest, Company
3. Create AuditAction enum: Create, Update, Delete, Deactivate, Approve, Reject, Move
4. Define schema with all fields
5. Create indexes on entityType, entityId, actor, createdAt for efficient querying
6. Add reference to User (actor) model
7. Add metadata field as flexible JSON storage
8. Create TypeScript interfaces
9. Export schema, model, and enums

## Acceptance Criteria
- Schema supports all entity types via enum
- All audit actions are represented in AuditAction enum
- Metadata field accepts any JSON structure
- Indexes optimize audit queries
- Actor reference works correctly
- Timestamps are auto-generated

## Technical Notes
```typescript
export enum EntityType {
  User = 'User',
  Inventory = 'Inventory',
  Item = 'Item',
  OrderRequest = 'OrderRequest',
  Company = 'Company'
}

export enum AuditAction {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Deactivate = 'Deactivate',
  Approve = 'Approve',
  Reject = 'Reject',
  Move = 'Move'
}

@Schema({ timestamps: true })
export class Audit {
  @Prop({ type: String, enum: EntityType, required: true, index: true })
  entityType: EntityType;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ type: String, enum: AuditAction, required: true })
  action: AuditAction;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actor: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Compound index for common query patterns
AuditSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditSchema.index({ actor: 1, createdAt: -1 });

export type AuditDocument = Audit & Document;
```

## Testing Requirements
- Test entity type enum validation
- Test action enum validation
- Test metadata field stores JSON correctly
- Test actor reference population
- Test indexes are created
- Test compound indexes work for queries

## Documentation Requirements
- Document entity types
- Document audit actions
- Document metadata usage patterns
- Document common audit query patterns

## Related Files
- `backend/src/audits/schemas/audit.schema.ts` (create)
- `backend/src/audits/enums/entity-type.enum.ts` (create)
- `backend/src/audits/enums/audit-action.enum.ts` (create)
- `backend/src/audits/audits.module.ts` (update)

## Notes
- Audits should be created for ALL significant actions
- Metadata field stores contextual information (e.g., changed fields, old/new values)
- Actor field tracks WHO performed the action
- EntityType + EntityId identify WHAT was changed
- Action describes the TYPE of change
- Audits are never deleted (immutable log)
- Indexes optimize common queries: "show me all audits for this item", "show me all actions by this user"

## Actions to Audit
- **User:** create, modify, deactivate
- **Inventory:** create, modify, delete items
- **Orders:** create, approve, reject
- **Items:** create, modify, delete, move (between inventories)
- **Company:** create, modify

## Metadata Examples
```typescript
// User deactivation
{
  reason: "Left company",
  deactivatedBy: "admin@company.com"
}

// Item moved
{
  fromInventory: "Company Main",
  toInventory: "Reseller A",
  orderId: "abc123"
}

// Order approved
{
  itemCount: 5,
  approvalNote: "All items verified"
}
```
