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

### **Step 3: Validate with Staged Typechecking**
```bash
pnpm run typecheck:staged
```

This validates only your staged changes using the full project configuration, ensuring:
- Path aliases resolve correctly (`@/components/ui/card`)
- JSX configuration works properly
- React Router route types are available
- All imports and dependencies are satisfied

### **Step 4: Evaluate and Commit**
- **✅ Passes**: Commit with confidence
  ```bash
  git commit -m "feat: implement focused change description"
  ```
- **❌ Fails**: Fix the identified type errors, then repeat from Step 2

## 📝 **Example Iterations**

### **Single File Iteration**
```bash
# Add Card component to subscriptions route
git add app/routes/subscriptions.tsx
pnpm run typecheck:staged
git commit -m "feat: add Card component to subscriptions page"
```

### **Multi-File Iteration**
```bash
# Add Button component and update multiple pages to use it
git add src/components/ui/button.tsx app/routes/home.tsx app/routes/subscriptions.tsx
pnpm run typecheck:staged
git commit -m "feat: add Button component and integrate across pages"
```

### **Feature Iteration**
```bash
# Complete feature: new component + route + integration
git add src/components/ui/table.tsx app/routes/subscriptions.tsx src/lib/utils.ts
pnpm run typecheck:staged
git commit -m "feat: add subscription table with sorting and filtering"
```

## ⚠️ **Important: TypeScript CLI Limitations**

**Do not use single file CLI typechecking:**
```bash
# ❌ These don't work properly:
npx tsc --noEmit app/routes/subscriptions.tsx
npx tsc --noEmit -p tsconfig.json app/routes/subscriptions.tsx
```

**Why**: TypeScript CLI doesn't allow mixing project configuration with source files, so single file typechecking doesn't load tsconfig.json properly.

**Solution**: Always use `pnpm run typecheck:staged` for iterative validation.

## 🔗 **Related Documentation**

- **[Typecheck Commands](#typecheck-commands)**: Available commands and their use cases
- **[Infrastructure Setup](#infrastructure)**: Path aliases, route types, and configuration
- **[Troubleshooting](#troubleshooting)**: Common issues and solutions
- **[Best Practices](#best-practices)**: Guidelines for humans and AI agents

## 🎯 **Benefits**

- **Zero Broken Commits**: Typechecking prevents committing broken code
- **Manageable Verification**: Small surface area is easy to review and validate
- **Fast Feedback**: Staged typechecking provides quick validation
- **Type Safety**: All dependencies and imports are validated at each step
- **Consistent**: Works identically for human contributors and AI agents

This workflow ensures that all changes, whether single file or multi-file, are properly validated before being committed to the codebase.

---

## Typecheck Commands

### Available Commands

#### **Full Project Typechecking**
```bash
pnpm run typecheck
# Equivalent: tsc --noEmit
# Use: Validate entire project
```

#### **Staged Files Typechecking** ⭐ **RECOMMENDED FOR ITERATIVE WORK**
```bash
pnpm run typecheck:staged
# Equivalent: git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' | sed 's|^frontend/||' | xargs tsc --noEmit
# Use: Validate only staged files before committing
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
   - Use staged typechecking to validate

2. **"Cannot use JSX unless the '--jsx' flag is provided"**
   - Solution: Don't use single file CLI typechecking
   - Use staged typechecking instead

3. **"Cannot find module './+types/route'"**
   - Solution: Run `pnpm run typecheck:routes` to generate route types
   - Use staged typechecking for validation

### Recovery Steps:
1. If typecheck fails, read the error messages carefully
2. Fix the identified issues (imports, dependencies, configuration)
3. Stage the fixed files and run typecheck again
4. Only commit when typecheck passes

---

## Best Practices

### For Human Contributors:
1. **Always use staged typechecking** before commits
2. **Commit frequently** with small, focused changes
3. **Read type errors carefully** - they're precise and actionable
4. **Use full project typechecking** for final validation

### For AI Coding Agents:
1. **Follow the iterative workflow**: modify → stage → typecheck → commit
2. **Never skip typechecking** - it catches dependency and configuration issues
3. **Use staged typechecking** for single file validation
4. **Handle type errors** by fixing the root cause, not bypassing

### For Both:
- **Trust the type system** - it prevents broken commits
- **Use the appropriate typecheck command** for your use case
- **Understand that single file CLI typechecking doesn't work** - use staged approach instead
- **Keep commits atomic** and focused on single logical changes
