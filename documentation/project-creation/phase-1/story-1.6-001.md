# Story 1.6-001: Implement OrderRequest Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 1.2-001, Story 1.4-001, Story 1.5-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the OrderRequest model supporting both standard (company→reseller) and devolution (reseller→company) orders with approval workflow.

## Tasks
1. Create `backend/src/orders/schemas/order-request.schema.ts`
2. Create OrderType enum: Standard, Devolution
3. Create OrderStatus enum: Pending, Approved, Rejected
4. Define schema with all fields
5. Add validation for status transitions
6. Add validation for required fields per order type
7. Create indexes on companyId, creator, status, sourceInventoryId, targetInventoryId, createdAt
8. Add references to User, Company, Inventory models
9. Add instance methods: canApprove(), canReject(), isExpired()
10. Create TypeScript interfaces
11. Export schema, model, and enums

## Acceptance Criteria
- OrderType enum distinguishes standard vs devolution orders
- OrderStatus enum enforces valid order states (Pending/Approved/Rejected)
- References populate correctly
- Items array stores item IDs
- Status transitions are validated
- Methods work correctly
- Indexes optimize queries

## Technical Notes
```typescript
export enum OrderType {
  Standard = 'Standard',
  Devolution = 'Devolution'
}

export enum OrderStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

@Schema({ timestamps: true })
export class OrderRequest {
  @Prop({ type: String, enum: OrderType, required: true })
  orderType: OrderType;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.Pending, index: true })
  status: OrderStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: true, index: true })
  sourceInventoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: true, index: true })
  targetInventoryId: Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop()
  devolutionReason?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Item' }], required: true })
  items: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;
}

export const OrderRequestSchema = SchemaFactory.createForClass(OrderRequest);

// Add methods
OrderRequestSchema.methods.canApprove = function(): boolean {
  return this.status === OrderStatus.Pending;
};

OrderRequestSchema.methods.canReject = function(): boolean {
  return this.status === OrderStatus.Pending;
};

OrderRequestSchema.methods.isExpired = function(): boolean {
  // Orders expire after 30 days if not processed
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt < thirtyDaysAgo && this.status === OrderStatus.Pending;
};

// Validation
OrderRequestSchema.pre('save', function(next) {
  if (this.status === OrderStatus.Rejected && !this.rejectionReason) {
    next(new Error('Rejection reason is required for rejected orders'));
  }
  if (this.orderType === OrderType.Devolution && !this.devolutionReason) {
    next(new Error('Devolution reason is required for devolution orders'));
  }
  next();
});

export type OrderRequestDocument = OrderRequest & Document;
```

## Testing Requirements
- Test order type enum validation
- Test status enum validation
- Test status transition logic
- Test canApprove() and canReject() methods
- Test isExpired() method
- Test required field validation per order type
- Test all indexes are created

## Documentation Requirements
- Document order types and their flows
- Document status lifecycle
- Document validation rules

## Related Files
- `backend/src/orders/schemas/order-request.schema.ts` (create)
- `backend/src/orders/enums/order-type.enum.ts` (create)
- `backend/src/orders/enums/order-status.enum.ts` (create)
- `backend/src/orders/orders.module.ts` (update)

## Notes
- Standard orders: company inventory → reseller inventory
- Devolution orders: reseller inventory → company inventory
- Only Pending orders can be approved or rejected
- Rejection requires a reason
- Devolution requires a reason for the return
- Orders older than 30 days and still Pending are considered expired
