# Documentation Style Guide

> **Purpose:** Senior engineering documentation that demonstrates technical thinking without marketing fluff.

## Core Principles

### ✅ INCLUDE
- **Concrete time savings** - "4 hours saved", "2+ hours faster development"
- **Honest trade-offs** - "Would personally choose X but adapted to Y constraint"
- **Technical reasoning** - Why this approach over alternatives
- **Cost comparisons** - "$0-20/month vs $50-100/month + 4 hours setup"
- **Scaling considerations** - Current capacity, next phase plans
- **Specific technical benefits** - "Catches bugs during development", "Eliminates entire categories of bugs"
- **Strategic constraints** - "16-hour constraint favors proven patterns"

### ❌ REMOVE
- **Dollar value claims** - "$50k-quality design", "looks like expensive custom work"
- **Made-up percentages** - "43% faster onboarding", "37% fewer disputes" (unless real data)
- **Marketing language** - "Amazing", "incredible", "game-changing"
- **Superlatives** - "Best", "perfect", "revolutionary"
- **Emotional claims** - "Users love it", "delightful experience"
- **Vague benefits** - "Better performance" (be specific)

## Documentation Structure

### Decision Format
```markdown
### Tool/Choice Name (~X hours saved)
**Problem:** Specific technical challenge being solved
**Solution:** What was chosen and why
**Benefits:**
- Concrete technical advantages
- Measurable outcomes
- Time/cost implications
**Trade-off:** What was sacrificed for this choice
**Alternative Considered:** Why other options were rejected
```

### Technical Tone Examples

**GOOD:**
- "Chose Express over Fastify for 16-hour constraint - familiar patterns save 2+ hours"
- "MongoDB required by company stack. Added validation layers for data integrity"
- "node-cron handles 1,000 users reliably. Would migrate to BullMQ at 10k+ users"

**BAD:**
- "Express provides amazing developer experience and incredible productivity gains"
- "MongoDB offers unparalleled flexibility for modern applications"
- "Our revolutionary scheduling system delivers enterprise-grade reliability"

## Business Context Integration

### Include Strategic Thinking
- Constraint management (time, tech stack, team)
- Future scaling plans with specific thresholds
- Cost analysis with real numbers
- Risk mitigation strategies

### Skip Business Buzzwords
- "Synergy", "paradigm shift", "disruptive"
- "World-class", "cutting-edge", "state-of-the-art"
- "Seamless", "effortless", "magical"

## Quality Standards

**Documentation should read like:**
- Senior engineer explaining decisions to team lead
- Technical postmortem with lessons learned
- Architecture decision record (ADR)

**Not like:**
- Marketing brochure
- Sales pitch
- Product launch announcement

---

**Remember:** The goal is demonstrating **engineering judgment**, **strategic thinking**, and **honest technical communication** - not selling a product.