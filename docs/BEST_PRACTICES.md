# Best Practices & Development Standards

> **Objective:** Document patterns that prevent bugs, improve maintainability, and accelerate development within time constraints.

## Form Validation Strategy

### Dual-Layer Validation (~1 hour saved per form)
**Problem:** Client-side validation can be bypassed; server-only validation provides poor UX.
**Solution:** Zod schemas shared between frontend and backend.

**Implementation:**
```typescript
// shared/validation/subscription.ts
export const subscriptionSchema = z.object({
  name: z.string().min(1, "Service name required"),
  cost: z.number().positive("Cost must be positive"),
  billingDate: z.date()
});

// Frontend form validation
const form = useForm<SubscriptionData>({
  resolver: zodResolver(subscriptionSchema)
});

// Backend route validation
app.post('/subscriptions', validate(subscriptionSchema), handler);
```

**Benefits:**
- Single source of truth for validation rules
- Consistent error messages across client/server
- TypeScript types generated automatically
- Prevents validation logic drift

**Trade-off:** Requires shared validation library setup, but saves debugging time.

---

## TypeScript Error Prevention

### Strict Configuration (~3 hours debugging saved)
**Problem:** Loose TypeScript settings allow runtime errors to slip through.
**Solution:** Strict mode with custom configuration for development velocity.

**Key Settings:**
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noImplicitReturns": true,
  "verbatimModuleSyntax": true
}
```

**Benefits:**
- Catches null/undefined errors at compile time
- Forces explicit typing for better code documentation
- Prevents implicit any types that hide bugs
- IDE provides better autocomplete and refactoring

**Exception:** Allow `any` only for third-party library integration with poor types.

### Type-Safe Event Handlers
**Problem:** Event handlers often have implicit `any` types from libraries.
**Solution:** Import proper types from library definitions.

**Example:**
```typescript
import type { ChangeEvent } from "cleave.js/react/props";

const handleCurrencyChange = (e: ChangeEvent<HTMLInputElement>) => {
  // Type-safe event handling
};
```

---

## State Management Patterns

### TanStack Query for Server State (~2 hours saved)
**Problem:** Manual loading states, error handling, and cache management is error-prone.
**Solution:** Declarative data fetching with automatic background sync.

**Pattern:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['subscriptions'],
  queryFn: fetchSubscriptions,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Benefits:**
- Automatic loading and error states
- Background refetching keeps data current
- Optimistic updates with rollback on failure
- Reduces boilerplate by 70%

**When Not To Use:** Static data or complex state machines.

### Local State with React Hook Form
**Problem:** Uncontrolled forms cause re-render issues and validation complexity.
**Solution:** React Hook Form with Zod integration.

**Benefits:**
- Minimal re-renders during typing
- Built-in validation integration
- Easy form reset and dirty state tracking
- Works well with shadcn/ui components

---

## Component Architecture

### Error State Management
**Problem:** Poor error handling creates confusing user experiences and hard-to-debug issues.
**Solution:** Consistent error state patterns with user-friendly messages.

**Implementation:**
```typescript
const { mutate, isLoading, error } = useMutation({
  mutationFn: createSubscription,
  onError: (error) => {
    toast.error(error.message || "Failed to create subscription");
  }
});

// Component error boundaries
if (error) {
  return <ErrorMessage message={error.message} onRetry={refetch} />;
}
```

**Benefits:**
- Users understand what went wrong
- Developers get detailed error info in console
- Consistent error UI patterns
- Easy retry mechanisms

### Loading State Consistency
**Problem:** Inconsistent loading states confuse users and feel unprofessional.
**Solution:** Standardized loading patterns with skeleton UI.

**Implementation:**
```typescript
if (isLoading) {
  return <SkeletonLoader />;
}

// Button loading states
<Button disabled={isSubmitting}>
  {isSubmitting ? "Saving..." : "Save Subscription"}
</Button>
```

**Benefits:**
- Users know the app is working
- Prevents duplicate submissions
- Professional appearance during data loading
- Consistent loading experience across app

### Error Boundary Strategy
**Problem:** Component errors crash entire application.
**Solution:** Error boundaries around route-level components.

**Pattern:**
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <SubscriptionDashboard />
</ErrorBoundary>
```

---

## API Design Patterns

### Consistent Response Format
**Problem:** Inconsistent API responses complicate frontend error handling.
**Solution:** Standardized response wrapper.

**Format:**
```typescript
type ApiResponse<T> = {
  data: T;
  error?: string;
  success: boolean;
};
```

**Benefits:**
- Predictable error handling in frontend
- Easy to add metadata (pagination, timestamps)
- TypeScript can infer response types
- Consistent logging format

### Request Validation Middleware
**Problem:** Duplicate validation logic across routes.
**Solution:** Reusable validation middleware with Zod.

**Implementation:**
```typescript
const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
      success: false
    });
  }
  next();
};
```

---

## Testing Strategy

### Focus on Critical User Flows
**Problem:** Comprehensive testing takes too long for MVP timeline.
**Solution:** Test authentication and core subscription CRUD operations.

**Priority:**
1. User registration/login (prevents broken auth)
2. Create/edit subscription (core business logic)
3. Currency detection (key differentiator)

**Tool Choice:** Playwright for integration tests - simulates real user interactions.

**Trade-off:** Unit tests deferred for faster delivery, but integration tests catch most critical issues.

---

## Database Patterns

### Validation at Application Layer
**Problem:** MongoDB doesn't enforce strict schemas like PostgreSQL.
**Solution:** Mongoose schemas with validation.

**Pattern:**
```typescript
const subscriptionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  cost: { type: Number, required: true, min: 0 },
  userId: { type: ObjectId, required: true, index: true }
});
```

**Benefits:**
- Consistent data structure
- Automatic validation before save
- Indexes defined with schema
- Migration-friendly approach

---

**Bottom Line:** These practices prioritize development velocity while maintaining code quality. Each pattern saves debugging time and prevents common mistakes.