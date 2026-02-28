# Story 1.1-001: Implement Company Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 2 hours
- **Dependencies:** Story 0.3-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the Company model with Mongoose schema, validation, and indexes for managing company data.

## Tasks
1. Create `backend/src/companies/schemas/company.schema.ts`
2. Define schema with fields:
   - name (String, required)
   - logo (String, optional, file path)
   - nit (String, required, unique)
   - createdAt (Date, auto-generated)
   - updatedAt (Date, auto-generated)
3. Add validation rules:
   - name: minimum 3 characters, maximum 100 characters
   - nit: unique constraint, alphanumeric validation
4. Create unique index on NIT field
5. Add timestamps plugin for automatic createdAt/updatedAt
6. Create TypeScript interface `ICompany` for type safety
7. Export schema and model
8. Add schema documentation comments

## Acceptance Criteria
- Schema compiles without TypeScript errors
- NIT uniqueness is enforced at database level
- Timestamps are auto-generated on create and update
- Unique index on NIT is created in MongoDB
- Schema validation prevents invalid data
- TypeScript interface matches schema structure

## Technical Notes
```typescript
@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, minlength: 3, maxlength: 100 })
  name: string;

  @Prop()
  logo?: string;

  @Prop({ required: true, unique: true, index: true })
  nit: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
export type CompanyDocument = Company & Document;
```

## Testing Requirements
- Unit tests: Schema validation rules
- Test NIT uniqueness constraint
- Test timestamps generation

## Documentation Requirements
- Add JSDoc comments to schema
- Document field constraints

## Related Files
- `backend/src/companies/schemas/company.schema.ts` (create)
- `backend/src/companies/companies.module.ts` (update with schema import)

## Notes
- NIT (Número de Identificación Tributaria) is the company tax ID
- Logo will store file path, actual file upload handled in Phase 14
