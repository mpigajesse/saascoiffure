# AGENTS.md - Guide for Coding Agents

This file contains essential information for AI agents working on the SaaS Hair Salon Management application.

## Project Overview

This is a multi-tenant SaaS application for hair salon management built with React, TypeScript, and Vite. The application serves both public-facing booking features and admin dashboard functionality.

**Core Architecture**: Multi-tenant by design - every data entity must be associated with a salon (tenant).

## Build & Development Commands

### Core Commands
- `npm run dev` - Start development server (port 8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build

### Quality Assurance
- `npm run lint` - Run ESLint (checks TypeScript and React best practices)
- `npm run test` - Run all tests once (Vitest)
- `npm run test:watch` - Run tests in watch mode

### Running Single Tests
To run a specific test file:
```bash
npm run test path/to/file.test.ts
```

## Project Structure

```
frontend-friend/
├── src/
│   ├── components/ui/     # shadcn/ui components
│   ├── contexts/          # React contexts (Auth, Tenant, etc.)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities (utils.ts for cn() function)
│   ├── pages/             # Page components
│   │   ├── public/        # Public-facing pages
│   │   └── [admin pages]  # Protected admin pages
│   ├── types/             # TypeScript type definitions
│   └── test/              # Test files and setup
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## Code Style Guidelines

### TypeScript & Imports
- **Strict TypeScript**: No `any` types without explicit justification
- **Import organization**: 
  - External libraries first
  - Internal imports with `@/` alias
  - Relative imports last
- **Prefer named exports** for components, default only for main App component

### Component Architecture
- **Small, focused components**: Single responsibility principle
- **Consistent naming**: PascalCase for components, camelCase for functions/variables
- **Props interface**: Always define TypeScript interfaces for component props
- **No business logic in components**: Delegate to hooks or services

### Styling & UI
- **Tailwind CSS only**: No inline styles or CSS modules
- **shadcn/ui components**: Use existing UI components from `@/components/ui/`
- **Utility function**: Use `cn()` from `@/lib/utils` for conditional classes
- **Responsive design**: Mobile-first approach with Tailwind breakpoints

### State Management
- **React Context**: Auth, Tenant, Admin, Appointments contexts
- **TanStack Query**: Server state management and caching
- **Local state**: useState/useReducer for component-specific state

## Multi-Tenant Rules (CRITICAL)

1. **Every data entity MUST have salonId**: All API calls and data structures must include salon context
2. **Tenant-aware contexts**: Use TenantProvider for all routes
3. **No cross-tenant data access**: Never allow data from one salon to be accessed by another
4. **Context switching**: Admin can switch between tenants, public routes are tenant-specific

## Error Handling

- **API errors**: Use try-catch with proper error logging
- **User feedback**: Use toast notifications (Sonner) for user-facing errors
- **Validation**: Use react-hook-form with zod schemas
- **Loading states**: Show loading indicators during async operations

## Testing Guidelines

- **Framework**: Vitest with jsdom environment
- **Test files**: `*.test.ts` or `*.spec.ts` extensions
- **Setup**: Test setup in `src/test/setup.ts`
- **Coverage**: Test critical business logic and components
- **Testing Library**: Use @testing-library/react for component tests

## Security Requirements

- **Authentication**: JWT-based auth via AuthContext
- **Protected routes**: Use ProtectedRoute component for admin pages
- **Input validation**: Zod schemas for all form inputs
- **No sensitive data**: Never expose API keys or secrets in frontend

## API Integration

- **TanStack Query**: Use useQuery for GET, useMutation for POST/PUT/DELETE
- **Error boundaries**: Implement error boundaries for graceful error handling
- **Optimistic updates**: Update UI immediately, rollback on error
- **Caching**: Configure appropriate cache times based on data volatility

## Naming Conventions

- **Components**: PascalCase (e.g., `ServiceCard`, `BookingForm`)
- **Functions**: camelCase (e.g., `fetchAppointments`, `validateForm`)
- **Variables**: camelCase with descriptive names (e.g., `selectedServiceId`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `API_BASE_URL`)
- **Files**: PascalCase for components, kebab-case for utilities

## Performance Considerations

- **Code splitting**: Lazy load routes and components
- **Memoization**: Use React.memo, useMemo, useCallback where appropriate
- **Bundle analysis**: Monitor bundle size and optimize imports
- **Images**: Optimize images and use appropriate formats

## Development Workflow

1. **Always run lint** before committing
2. **Write tests** for new features and bug fixes
3. **Follow multi-tenant rules** strictly
4. **Use TypeScript** - ensure all types are properly defined
5. **Test responsive design** on different screen sizes

## Common Patterns

### Custom Hook Example
```typescript
export function useServiceList() {
  const { salonId } = useTenant();
  return useQuery({
    queryKey: ['services', salonId],
    queryFn: () => fetchServices(salonId)
  });
}
```

### Component Structure
```typescript
interface Props {
  // Define props interface
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## Forbidden Patterns

- ❌ Direct database access from frontend
- ❌ Hardcoding business logic rules
- ❌ Bypassing authentication/authorization
- ❌ Cross-tenant data access
- ❌ Using `any` type without justification
- ❌ Inline styles or CSS modules
- ❌ Duplication of business logic

## Quality Checklist Before Commit

- [ ] Multi-tenant rules followed (salonId everywhere)
- [ ] TypeScript types are correct
- [ ] ESLint passes without errors
- [ ] Tests pass (if applicable)
- [ ] No hardcoded business logic
- [ ] Proper error handling implemented
- [ ] Loading states included for async operations
- [ ] Responsive design considered

## Additional Resources

- **shadcn/ui**: Refer to component documentation at `https://ui.shadcn.com/`
- **Tailwind CSS**: Use utility classes and design tokens
- **TanStack Query**: Documentation for data fetching patterns
- **React Router**: Navigation and route protection patterns

This file should be updated as the project evolves and new patterns emerge.