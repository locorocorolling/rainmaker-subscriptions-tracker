# Frontend Development Workflow

## 🎯 **Workflow Overview**

Frontend development follows a two-phase workflow:

1. **[Development Workflow](working-docs/development/FRONTEND_DEVELOPMENT_WORKFLOW.md)**: Code validation (typecheck + build)
2. **[Commit Workflow](working-docs/development/COMMIT_WORKFLOW.md)**: Git staging and committing

## 🚀 **Development Process**

### **Phase 1: Development Workflow**
```bash
# 1. Make your code changes
# 2. Validate type safety
pnpm run typecheck

# 3. Verify production build
pnpm run build

# 4. Only if both pass → proceed to commit workflow
```

### **Phase 2: Commit Workflow**
```bash
# Follow COMMIT_WORKFLOW.md for:
# - File staging
# - Change validation
# - Commit message generation
# - Final commit
```

## 🔗 **Related Documentation**

- **[Frontend Development Workflow](working-docs/development/FRONTEND_DEVELOPMENT_WORKFLOW.md)**: Typecheck and build validation
- **[Commit Workflow](working-docs/development/COMMIT_WORKFLOW.md)**: Git staging and commit process

---

## Typecheck Commands

### Available Commands

#### **Full Project Typechecking** ⭐ **RECOMMENDED**
```bash
pnpm run typecheck
# Use: Validate entire project before committing
```

#### **Full Project with Route Type Generation**
```bash
pnpm run typecheck:full
# Use: Complete validation including route type regeneration
```

#### **Route Type Generation Only**
```bash
pnpm run typecheck:routes
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
Route types are automatically generated in `.react-router/types/` and included in TypeScript configuration.

---

## Troubleshooting

### Common Issues:
1. **"Cannot find module '@/components/ui/xyz'"**
   - Solution: Ensure path alias is correct and component exists

2. **"Cannot use JSX unless '--jsx' flag is provided"**
   - Solution: Use full project typechecking, not single file

3. **"Cannot find module './+types/route'"**
   - Solution: Run `pnpm run typecheck:routes` to generate route types

4. **IDE TypeScript Errors vs Command Line Success**
   - Solution: Reload IDE window to refresh TypeScript server

### Recovery Steps:
1. Read type errors carefully and fix identified issues
2. Run build to ensure production readiness
3. Only commit when both typecheck and build pass

---

## Best Practices

### For Human Contributors:
1. **Always use full project typechecking** before commits
2. **Run build command** to ensure production readiness
3. **Commit frequently** with small, focused changes
4. **Read type errors carefully** - they're precise and actionable
5. **Reload IDE window** if TypeScript errors don't match command line results

### For AI Coding Agents:
1. **Follow the two-phase workflow**: development validation → commit process
2. **Never skip typechecking** - it catches dependency and configuration issues
3. **Always run build** - ensures changes work in production
4. **Handle type errors** by fixing the root cause, not bypassing
5. **Use full project typechecking** for validation

### For Both:
- **Trust the type system** - it prevents broken commits
- **Use the appropriate commands** for your use case
- **Keep commits atomic** and focused on single logical changes
- **Build before committing** to catch production issues early