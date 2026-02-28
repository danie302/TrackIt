# Story 8.1-001: Login Screen

## Metadata
- **Category:** Frontend Auth
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 7.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement login screen with email/password form, validation, and role-based redirection.

## Tasks
1. Create LoginPage component
2. Implement form with React Hook Form
3. Add form validation
4. Call login API
5. Store token and user data
6. Redirect based on user role
7. Handle errors
8. Add "Remember me" option
9. Link to forgot password

## Technical Implementation
```typescript
// src/pages/Auth/LoginPage.tsx
export const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onSubmit = async (data) => {
    try {
      const response = await authApi.login(data.email, data.password);
      login(response.data.user, response.data);
      
      // Role-based redirect
      switch (response.data.user.role) {
        case Role.MasterAdmin:
          navigate('/dashboard');
          break;
        case Role.CompanyAdmin:
          navigate('/company-admin');
          break;
        case Role.Employer:
          navigate('/employer');
          break;
        case Role.Reseller:
          navigate('/reseller');
          break;
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };
};
```

## Acceptance Criteria
- Form validation works
- Login successful redirects correctly
- Error messages displayed
- Loading state shown

## Related Files
- `src/pages/Auth/LoginPage.tsx` (create)
