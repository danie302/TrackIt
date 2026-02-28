# Story 1.2-001: Implement User Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 0.3-001, Story 1.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the User model with authentication fields, role management, and proper validation including password hashing.

## Tasks
1. Create `backend/src/users/schemas/user.schema.ts`
2. Define Role enum: `MasterAdmin`, `CompanyAdmin`, `Employer`, `Reseller`
3. Define schema with all required fields
4. Create unique indexes on email and username
5. Create index on companyId for query performance
6. Add pre-save hook for password hashing using bcrypt
7. Add method `comparePassword(candidatePassword)` for authentication
8. Create TypeScript interfaces for User and UserDocument
9. Export schema, model, and Role enum

## Acceptance Criteria
- Schema enforces email and username uniqueness
- Passwords are automatically hashed before saving (bcrypt, 10 rounds)
- Role enum validates only allowed values
- Password comparison method works correctly
- isActive field defaults to true
- All indexes are created in MongoDB

## Technical Notes
**Password Hashing:**
```typescript
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Password Comparison:**
```typescript
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
```

## Testing Requirements
- Test password hashing on user creation
- Test password comparison method
- Test role enum validation
- Test email/username uniqueness

## Related Files
- `backend/src/users/schemas/user.schema.ts` (create)
- `backend/src/users/enums/role.enum.ts` (create)

## Notes
- Never store plain text passwords
- Password hash rounds: 10 (balance between security and performance)
- Master Admin users have special companyId value: "admin"
