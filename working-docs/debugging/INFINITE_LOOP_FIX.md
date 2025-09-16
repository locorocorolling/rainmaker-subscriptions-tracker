# Infinite Loop Fix: Maximum Update Depth Exceeded

**Date:** September 17, 2025  
**Component:** `SubscriptionList.tsx`  
**Error:** "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."

## Problem Description

The application was experiencing an infinite update loop in the `SubscriptionList` component, causing the browser to become unresponsive and display the "Maximum update depth exceeded" error.

## Root Cause Analysis

### Initial Suspected Cause
Initially, the error appeared to be caused by a circular dependency in a `useMemo` hook:

```typescript
const sortedSubscriptions = useMemo(() => {
  return table.getSortedRowModel().rows.map(row => row.original);
}, [table, filteredSubscriptions, sorting]); // ❌ 'table' was problematic
```

The `table` object from TanStack Table was being recreated internally when its state changed, causing the `useMemo` to recalculate, which triggered more table state changes.

### Actual Root Cause
While fixing the `useMemo` helped, the primary cause was discovered to be the `mockSubscriptions` array being defined **inside** the component:

```typescript
export function SubscriptionList({ subscriptions = [] }: SubscriptionListProps) {
  // ... state declarations
  
  // ❌ PROBLEM: This array is recreated on every render
  const mockSubscriptions: Subscription[] = [
    { id: "1", service: "Netflix", ... },
    { id: "2", service: "Spotify", ... },
    // ... more mock data
  ];

  // This useEffect runs whenever subscriptions changes OR when mockSubscriptions reference changes
  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      setAllSubscriptions(subscriptions);
    } else {
      setAllSubscriptions(mockSubscriptions); // ❌ New array reference every time
    }
  }, [subscriptions]); // Missing mockSubscriptions dependency, but it changes every render anyway
```

### The Infinite Loop Cycle

1. **Component renders** → New `mockSubscriptions` array created with new reference
2. **useEffect runs** (due to `subscriptions` dependency or first render)
3. **setAllSubscriptions(mockSubscriptions)** called with new array reference
4. **State update triggers re-render**
5. **Back to step 1** → Infinite loop

## Solution

### Primary Fix: Move Mock Data Outside Component
```typescript
// ✅ SOLUTION: Move outside component to prevent recreation
const mockSubscriptions: Subscription[] = [
  { id: "1", service: "Netflix", ... },
  { id: "2", service: "Spotify", ... },
  // ... mock data
];

export function SubscriptionList({ subscriptions = [] }: SubscriptionListProps) {
  // Now mockSubscriptions has a stable reference across renders
  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      setAllSubscriptions(subscriptions);
    } else {
      setAllSubscriptions(mockSubscriptions); // ✅ Same reference every time
    }
  }, [subscriptions]);
```

### Secondary Fix: Remove Table from useMemo Dependencies
```typescript
// ✅ Remove 'table' dependency to prevent circular updates
const sortedSubscriptions = useMemo(() => {
  return table.getSortedRowModel().rows.map(row => row.original);
}, [filteredSubscriptions, sorting]); // ✅ Only depend on actual data
```

## Key Learnings

### 1. **Object/Array References in React**
- Objects and arrays created inside components get new references on every render
- These new references cause dependency arrays to think values have changed
- Move stable data outside components or use `useMemo`/`useState` for initialization

### 2. **useEffect Dependency Analysis**
- Always include ALL dependencies that the effect uses
- If a dependency changes on every render, investigate why
- Consider if the dependency should be stable (moved outside) or memoized

### 3. **Circular Dependencies with Third-Party Libraries**
- Libraries like TanStack Table may recreate objects internally
- Don't include these unstable objects in dependency arrays
- Focus dependencies on actual data that should trigger updates

### 4. **Debugging Infinite Loops**
- Use React DevTools Profiler to identify re-rendering components
- Look for state updates in `useEffect` without proper dependencies
- Check for objects/arrays being recreated inside components

## Prevention Strategies

1. **Static Data Placement**
   ```typescript
   // ✅ Good: Outside component
   const MOCK_DATA = [...];
   
   // ❌ Bad: Inside component
   function Component() {
     const mockData = [...];
   }
   ```

2. **Stable References**
   ```typescript
   // ✅ Good: Memoized
   const mockData = useMemo(() => [...], []);
   
   // ✅ Good: useState initialization
   const [mockData] = useState(() => [...]);
   ```

3. **Dependency Array Best Practices**
   ```typescript
   // ✅ Include all used values
   useEffect(() => {
     doSomething(value1, value2);
   }, [value1, value2]);
   
   // ❌ Don't include unstable objects from libraries
   useEffect(() => {
     // tableObject is recreated by library
   }, [tableObject]); // Bad
   ```

## Files Modified

- `/frontend/src/components/SubscriptionList.tsx`
  - Moved `mockSubscriptions` outside component
  - Fixed `useMemo` dependency array for `sortedSubscriptions`

## Validation

- ✅ `pnpm run typecheck` passes (no new TypeScript errors)
- ✅ `pnpm run build` completes successfully
- ✅ No "Maximum update depth exceeded" error in browser console
- ✅ Component renders and functions normally

## Related Issues

This fix resolves both the circular dependency issue with TanStack Table and the array recreation issue, providing a comprehensive solution to React infinite loop problems in this component.
