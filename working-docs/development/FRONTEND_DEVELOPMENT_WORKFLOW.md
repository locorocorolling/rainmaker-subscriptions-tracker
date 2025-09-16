# Frontend Development Workflow

## 🎯 **Core Philosophy**

Validate frontend code quality before committing. Ensure type safety and build success before proceeding to commit workflow.

## 🔄 **Development Process**

### **Step 1: Make Changes**
Implement focused changes to frontend code.

### **Step 2: Typecheck Validation**
```bash
pnpm run typecheck
```
**Purpose**: Verify TypeScript compilation, catch type errors, validate path aliases.

**✅ Success**: No errors → proceed to Step 3
**❌ Failure**: Fix errors and repeat

### **Step 3: Build Validation**
```bash
pnpm run build
```
**Purpose**: Ensure production readiness, validate dependencies, verify bundling.

**✅ Success**: Build completes → proceed to commit workflow
**❌ Failure**: Fix errors and return to Step 2

### **Step 4: Proceed to Commit Workflow**
```bash
# Code validated, ready to commit
git status
# Follow COMMIT_WORKFLOW.md guidelines
```

## 🚨 **Common Failures**

### **Typecheck Issues**
- Missing imports, incorrect path aliases
- TypeScript compilation errors
- React Router type issues

### **Build Issues**
- Dependency problems, missing packages
- Bundle optimization failures
- Asset resolution errors

## 🔗 **Related Documentation**
- **[COMMIT_WORKFLOW.md](COMMIT_WORKFLOW.md)**: Git staging and committing
- **[Frontend AGENTS.md](../../frontend/AGENTS.md)**: Typecheck commands and troubleshooting

## 🎯 **Benefits**
- **Zero broken commits**: Only working code gets committed
- **Production ready**: All changes work in deployment
- **Fast feedback**: Quick validation cycle
- **Type safety**: Catches issues early

---

**Key**: Always complete this workflow before starting the commit process.