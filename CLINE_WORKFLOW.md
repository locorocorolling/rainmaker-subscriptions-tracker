# Cline Git Workflow

## 🎯 **Core Philosophy**
Streamline git commit process with intelligent file staging and user confirmation for final approval.

## ⚠️ **Important: Cline Git Command Usage**
**When working with Cline, always prefix git commands with `--no-pager` to prevent interactive pager issues.** This applies to all git commands that might produce paginated output (log, diff, show, status, etc.).

**Example**: Use `git --no-pager status` instead of `git status`

## 🔄 **Mode Selection**

### **Autonomous Mode (Default)**
**Trigger**: Root AGENTS.md prompts user on session start
**Purpose**: Agent handles entire commit process intelligently with self-correction
**Flow**: Agent → git status → smart staging → git diff → commit message → user confirmation → commit

### **User Confirmation Mode**
**Trigger**: User selects confirmation mode when prompted
**Purpose**: Agent handles all steps but requires explicit user approval before committing
**Flow**: Agent → git status → smart staging → git diff → commit message → present to user → wait for confirmation → commit

## 📋 **Universal Workflow Steps**

### **Step 1: Change Assessment (Universal)**
```bash
# Agent ALWAYS runs git status first
git --no-pager status
```
**Purpose**: 
- Identify all modified files
- Distinguish between relevant and irrelevant changes
- Detect untracked files that might need attention
- Inform staging strategy

**Note**: Always use `git --no-pager` when working with Cline to prevent interactive pager issues

### **Step 2: Intelligent File Staging**

#### **Both Modes Use Same Staging Logic**
```bash
# Agent analyzes git status output and:
git status
# 1. Identify relevant changes for current task
# 2. Filter out unrelated modifications
# 3. Group related files logically
# 4. Stage only relevant files
git add path/to/relevant_file1.tsx path/to/relevant_file2.tsx

# 5. Verify staging was correct
git status
# 6. Self-correction: if wrong files staged, unstage and retry
git reset path/to/wrong_file.tsx
git add path/to/correct_files/
```

**Self-Correction Logic**:
- **Over-staging detected**: Unstage files unrelated to current task
- **Under-staging detected**: Add missing files that are part of current task
- **Wrong groupings**: Restage files in more logical groupings
- **Untracked files**: Ignore unless explicitly part of task

### **Step 3: Change Validation (Universal)**
```bash
# Agent ALWAYS runs diff on staged files
git diff --staged
```
**Purpose**: 
- Verify staged changes match intent
- Catch unintended modifications
- Inform commit message content
- Final validation before commit

### **Step 4: Commit Message Generation**

**Goal**: Write commit messages that are concise but informative, following senior-level best practices.  

#### **Commit Title (first line)**
- ≤ 50 characters if possible  
- Imperative mood (e.g. "Add", "Fix", "Update", not "Added" or "Fixes")  
- Summarize **intent** (the "what" / outcome), not implementation detail  

✅ Example:  
```
fix(auth): prevent token expiry during refresh
```

❌ Bad Example:  
```
fixed bug in auth token refresh logic
```

#### **Commit Body (optional, for non-trivial changes)**
- Start after a blank line below title  
- Wrap lines at ~72 chars  
- Answer **why** the change was needed, plus **what** was done  
- Add **justification/trade-offs** if relevant  
- Mention tricky details if they won't be obvious from the diff  
- Reference issue/ticket IDs (`Refs #1234`)  
- Mark breaking changes explicitly with `BREAKING CHANGE:`  

✅ Example:  
```
fix(auth): prevent token expiry during refresh

Token refresh sometimes failed because we requested a new
token too late. Added a 30s buffer window to guarantee 
validity. Chose buffer over retry-loop to avoid extra load.

Refs #1234
```

#### **Commit Quality Checklist (agent enforces before finalizing)**
- [ ] Title ≤ 50 chars  
- [ ] Title imperative, clear intent  
- [ ] Body present if change is non-trivial  
- [ ] Body explains "why" not just "what"  
- [ ] References issues if relevant  
- [ ] BREAKING CHANGE section if applicable  

#### **Mode Integration**
- **Autonomous Mode**: Agent commits directly after generating message (title + optional body).  
- **User Confirmation Mode**: Agent shows staged files + generated commit (title + body) → waits for user approval or edits.  

---

### **Step 5: Mode-Specific Final Step**

#### **Autonomous Mode**
```bash
# Agent commits with multi-line message if body exists
git commit -m "fix(auth): prevent token expiry during refresh" \
-m "Token refresh sometimes failed because we requested a new
token too late. Added a 30s buffer window to guarantee 
validity. Chose buffer over retry-loop to avoid extra load.

Refs #1234"
```

#### **User Confirmation Mode**
```bash
# Agent presents commit preview
echo "Ready to commit with message:"
echo "---------------------------------"
echo "fix(auth): prevent token expiry during refresh"
echo
echo "Token refresh sometimes failed because we requested a new"
echo "token too late. Added a 30s buffer window to guarantee"
echo "validity. Chose buffer over retry-loop to avoid extra load."
echo
echo "(Proceed with commit? y/n/modify)"
```
**User Responses**:
- `y` or `yes`: Agent proceeds with commit  
- `n` or `no`: Agent returns to staging step for corrections  
- `modify`: Agent regenerates commit message and reprompts

## 🤖 **Intelligent Staging (Both Modes)**

### **Git Status Analysis**
```bash
# Agent parses git status output:
On branch feature-subscription-table-integration
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   frontend/src/components/ui/table.tsx
        modified:   frontend/AGENTS.md
        modified:   AGENTS.md
        modified:   WHAT'S_NEXT.md
        modified:   PLAYWRIGHT_TEST_RESULTS.md

no changes added to commit (use "git add" and/or "git commit -a")
```

**Agent Decision Process**:
1. **Task Context**: "Documentation updates for AGENTS.md files"
2. **Relevant Files**: `frontend/AGENTS.md`, `AGENTS.md`
3. **Irrelevant Files**: `frontend/src/components/ui/table.tsx`, `WHAT'S_NEXT.md`, `PLAYWRIGHT_TEST_RESULTS.md`
4. **Staging Action**: `git add frontend/AGENTS.md AGENTS.md`

### **Self-Correction Scenarios**

#### **Scenario 1: Over-staging**
```bash
# Agent mistakenly stages all files
git add .
# Git status shows everything staged
# Agent realizes: "Task was only documentation updates"
# Self-correction:
git reset frontend/src/components/ui/table.tsx WHAT'S_NEXT.md PLAYWRIGHT_TEST_RESULTS.md
```

#### **Scenario 2: Under-staging**
```bash
# Agent stages only AGENTS.md
# Git status shows frontend/AGENTS.md still modified
# Agent realizes: "Both AGENTS.md files are part of documentation updates"
# Self-correction:
git add frontend/AGENTS.md
```

## 🎛️ **Mode Decision Tree**

```
Start Session
    ↓
Root AGENTS.md prompts: "Autonomous or User Confirmation mode?"
    ↓
Autonomous Mode                User Confirmation Mode
    ↓                              ↓
Run git status                  Run git status
    ↓                              ↓
Analyze changes                 Analyze changes
    ↓                              ↓
Stage relevant files            Stage relevant files
    ↓                              ↓
Verify with git status          Verify with git status
    ↓                              ↓
Self-correct if needed          Self-correct if needed
    ↓                              ↓
git diff --staged               git diff --staged
    ↓                              ↓
Generate commit message        Generate commit message
    ↓                              ↓
Commit immediately             Present to user:
                                 - Commit message
                                 - Staged files list
                                 ↓
                                 Wait for user confirmation
                                 ↓
                                 If confirmed: Commit
                                 If rejected: Return to staging
```

## 💡 **User Confirmation Mode Details**

### **User Response Handling**
- **y/yes**: Execute commit immediately
- **n/no**: 
  ```bash
  Agent: "I'll return to staging. Would you like to:
  1. Stage different files
  2. Modify the commit message
  3. Cancel this commit entirely"
  ```
- **modify**: 
  ```bash
  Agent: "What would you like to change about the commit message?"
  # Regenerates based on user feedback
  ```

## 🔄 **Recovery Scenarios**

### **User Rejects Commit**
```bash
# User responds 'n' to confirmation
Agent: "I understand you'd like to modify this commit. 
Would you prefer to:
1. Stage different files
2. Change the commit message
3. Start over with staging"
```

### **User Requests Modification**
```bash
# User responds 'modify' or provides specific feedback
Agent: "I'll regenerate the commit message. 
What specific aspects would you like me to focus on or change?"
# After receiving feedback, regenerates and reprompts
```

## 💡 **Enhanced Best Practices**

### **For Both Modes**
- **Consistent staging**: Same intelligent staging logic in both modes
- **Transparency**: Always show what will be committed
- **Recovery options**: Clear paths when user wants to make changes

## ⚠️ **Commit Message Conciseness**

### **Do's**
- `feat: add user authentication`
- `fix: resolve login validation error`
- `docs: update API endpoints`
- `refactor: extract service layer`

### **Don'ts**
- Long lists of changed files
- Implementation mechanics
- Technical process details
- Unnecessary context

### **Examples**
**Good**:
```
feat: integrate subscription list component
```

**Verbose (Avoid)**:
```
feat: integrate subscription list component with sorting, filtering, and summary cards, updated routes to use new component, added TypeScript interfaces, and implemented mock data structure
```

## 🎯 **Key Benefits**

### **Clearer Mental Model**
- **Autonomous Mode**: "I trust the agent to handle everything"
- **User Confirmation Mode**: "I want the agent to do the work but I make the final call"

### **Better User Experience**
- **No waiting around**: User doesn't need to review git status manually
- **Focused confirmation**: User sees exactly what will be committed and makes a quick decision
- **Easy correction**: Simple process to make changes if needed

### **Maintains Efficiency**
- **Both modes use same staging logic**: No duplication of intelligent staging
- **Self-correction in both modes**: Autonomous error handling regardless of final approval
- **Fast confirmation**: Quick y/n response is much faster than manual review

### **Flexible Control**
- **Per-session choice**: User can select mode based on current task complexity
- **Easy to switch**: Can change modes for different types of commits
- **Progressive trust**: Start with confirmation mode, move to autonomous as trust builds
