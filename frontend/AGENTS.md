# Frontend Development Workflow

## 🎯 **Core Philosophy**

Use **small, focused changes** with type safety at every step. The goal is to keep the surface area manageable for verification, whether by humans or AI agents.

## 🚀 **The Iterative Process**

### **Step 1: Make Focused Changes**
Modify one or more related files to implement a single logical change. Examples:
- Add a new component import to existing files
- Update component usage across multiple related files
- Create a new feature with its components and routes

**Key**: Keep changes focused and related. Don't mix unrelated features in the same iteration.

### **Step 2: Stage Changes**
```bash
# Stage all files involved in this iteration
git add path/to/file1.tsx path/to/file2.tsx
```

### **Step 3: Validate with Typechecking and Build**
```bash
# Run typecheck on all files
pnpm run typecheck

# Run build to ensure production readiness
pnpm run build
```

This validates your changes using the full project configuration, ensuring:
- Path aliases resolve correctly (`@/components/ui/card`)
- JSX configuration works properly
- React Router route types are available
- All imports and dependencies are satisfied
- Production build completes successfully

### **Step 4: Evaluate and Commit**
- **✅ Passes**: Commit with confidence
  ```bash
  git commit -m "feat: implement focused change description"
  ```
- **❌ Fails**: Fix the identified type errors, then repeat from Step 2

## 📝 **Example Iterations**

### **Single Component Iteration**
```bash
# Add Card component to home route
git add src/components/ui/card.tsx src/lib/utils.ts
pnpm run typecheck
pnpm run build
git commit -m "feat: integrate Card components in home page"
```

### **Multi-Component Iteration**
```bash
# Add Button component and update pages to use it
git add src/components/ui/button.tsx app/routes/home.tsx
pnpm run typecheck
pnpm run build
git commit -m "feat: integrate Button components in home page"
```

### **Feature Iteration**
```bash
# Complete feature: new component + route + integration
git add src/components/ui/badge.tsx app/routes/subscriptions.tsx
pnpm run typecheck
pnpm run build
git commit -m "feat: enhance subscriptions page with Card, Button, and Badge components"
```

## ⚠️ **Important: TypeScript CLI Limitations**

**Do not use single file CLI typechecking:**
```bash
# ❌ These don't work properly:
npx tsc --noEmit app/routes/subscriptions.tsx
npx tsc --noEmit -p tsconfig.json app/routes/subscriptions.tsx
```

**Why**: TypeScript CLI doesn't allow mixing project configuration with source files, so single file typechecking doesn't load tsconfig.json properly.

**Solution**: Always use `pnpm run typecheck` for full project validation.

## 🔗 **Related Documentation**

- **[Typecheck Commands](#typecheck-commands)**: Available commands and their use cases
- **[Infrastructure Setup](#infrastructure)**: Path aliases, route types, and configuration
- **[Troubleshooting](#troubleshooting)**: Common issues and solutions
- **[Best Practices](#best-practices)**: Guidelines for humans and AI agents

## 🎯 **Benefits**

- **Zero Broken Commits**: Typechecking and build prevent committing broken code
- **Manageable Verification**: Small surface area is easy to review and validate
- **Fast Feedback**: Typechecking provides quick validation
- **Type Safety**: All dependencies and imports are validated at each step
- **Production Ready**: Build step ensures changes work in production
- **Consistent**: Works identically for human contributors and AI agents

This workflow ensures that all changes, whether single file or multi-file, are properly validated before being committed to the codebase.

---

## Typecheck Commands

### Available Commands

#### **Full Project Typechecking** ⭐ **RECOMMENDED FOR ITERATIVE WORK**
```bash
pnpm run typecheck
# Equivalent: tsc --noEmit
# Use: Validate entire project before committing
```

#### **Full Project with Route Type Generation**
```bash
pnpm run typecheck:full
# Equivalent: react-router typegen && tsc --noEmit
# Use: Complete validation including route type regeneration
```

#### **Route Type Generation Only**
```bash
pnpm run typecheck:routes
# Equivalent: react-router typegen
# Use: Generate React Router route types
```

### **Removed Commands**
The following command was removed due to complexity and reliability issues:
- `typecheck:staged` - Replaced with simpler `typecheck` + `build` workflow

---

## Infrastructure Setup

### Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"],
      "@/*": ["./src/*"]
    }
  }
}
```
- `~/` → `app/` directory (React Router routes)
- `@/` → `src/` directory (custom components and utilities)

### React Router Route Types
Route types are automatically generated in `.react-router/types/` and are included in the TypeScript configuration via:
```json
{
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

---

## Troubleshooting

### Common Issues:
1. **"Cannot find module '@/components/ui/xyz'"**
   - Solution: Ensure path alias is correct and component exists
   - Use full project typechecking to validate

2. **"Cannot use JSX unless the '--jsx' flag is provided"**
   - Solution: Don't use single file CLI typechecking
   - Use full project typechecking instead

3. **"Cannot find module './+types/route'"**
   - Solution: Run `pnpm run typecheck:routes` to generate route types
   - Use full project typechecking for validation

4. **IDE TypeScript Errors vs Command Line Success**
   - Solution: Reload IDE window to refresh TypeScript server
   - This can happen when opening workspace from root level in monorepo setups

### Recovery Steps:
1. If typecheck fails, read the error messages carefully
2. Fix the identified issues (imports, dependencies, configuration)
3. Stage the fixed files and run typecheck again
4. Run build to ensure production readiness
5. Only commit when both typecheck and build pass

---

## Best Practices

### For Human Contributors:
1. **Always use full project typechecking** before commits
2. **Run build command** to ensure production readiness
3. **Commit frequently** with small, focused changes
4. **Read type errors carefully** - they're precise and actionable
5. **Reload IDE window** if TypeScript errors don't match command line results

### For AI Coding Agents:
1. **Follow the iterative workflow**: modify → stage → typecheck → build → commit
2. **Never skip typechecking** - it catches dependency and configuration issues
3. **Always run build** - ensures changes work in production
4. **Handle type errors** by fixing the root cause, not bypassing
5. **Use full project typechecking** for validation

### For Both:
- **Trust the type system** - it prevents broken commits
- **Use the appropriate typecheck command** for your use case
- **Understand that single file CLI typechecking doesn't work** - use full project approach instead
- **Keep commits atomic** and focused on single logical changes
- **Build before committing** to catch production issues early
- **Reload IDE** when TypeScript server gets out of sync
