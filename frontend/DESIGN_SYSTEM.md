# 🎨 SubTracker Design System Reference

## Core Design Philosophy
Professional, clean, and consistent using shadcn/ui components with semantic color tokens rather than hardcoded values.

## 📁 Key Reference Files

**1. Color & Design Tokens:**
- `frontend/src/components/ui/button.tsx` - Button variants and styling patterns
- `frontend/src/components/ui/card.tsx` - Card structure and shadows
- `frontend/app/root.tsx:48` - Root background (`bg-gray-50`)

**2. Component Patterns:**
- `frontend/src/components/SpendSummaryCard.tsx` - Professional card layout
- `frontend/src/components/SubscriptionList.tsx` - Table and interaction patterns
- `frontend/src/components/Navigation.tsx` - Final navigation implementation

## 🎯 Design Principles

**Colors (Semantic, not hardcoded):**
```css
- bg-background (instead of bg-white)
- text-muted-foreground (instead of text-gray-500)
- bg-muted (instead of bg-gray-100)
- text-primary (instead of text-blue-600)
- bg-primary (instead of bg-blue-500)
- text-destructive (for logout/delete actions)
```

**Components over Custom Styling:**
- Use `<Button variant="ghost|secondary|outline">` instead of custom styled divs
- Wrap content in `<Card><CardContent>` for proper elevation/shadows
- Apply `shadow-sm` for subtle depth, `shadow-lg` for overlays

**Typography Consistency:**
- Page titles: `text-3xl font-bold`
- Subtitles: `text-gray-600` (exception for page descriptions)
- Icon sizing: `w-4 h-4` for nav items, `w-5 h-5` for mobile nav

**Spacing Patterns:**
- Container padding: `p-4` for cards, `p-6` for page containers
- Gap spacing: `gap-3` for icon+text, `gap-2` for buttons
- Border radius: `rounded-lg` for cards, `rounded-md` for buttons

## 🏗️ Layout Structure
```tsx
<Layout> // Handles navigation
  <div className="container mx-auto p-6 max-w-6xl"> // Page wrapper
    <div className="mb-8"> // Header section
      <h1 className="text-3xl font-bold mb-2">Title</h1>
      <p className="text-gray-600">Subtitle</p>
    </div>
    <Card> // Content in cards
      <CardContent>...</CardContent>
    </Card>
  </div>
</Layout>
```

## 🔧 Navigation Patterns
- **Desktop:** Button-based nav with `variant="secondary"` for active state
- **Mobile:** Semantic colors (`text-primary` for active, `text-muted-foreground` for inactive)
- **User sections:** Wrapped in Card components for proper elevation
- **Placeholders:** Use `bg-muted` badges with "Soon" text

## ✅ Quality Checklist
When implementing new components:
1. ✅ Use semantic color tokens (bg-background, text-muted-foreground)
2. ✅ Leverage existing shadcn/ui components (Button, Card, etc.)
3. ✅ Follow spacing patterns (p-4, gap-3, mb-8)
4. ✅ Apply consistent typography hierarchy
5. ✅ Use proper shadow system (shadow-sm, shadow-lg)

## 📝 Missing Elements to Consider
- **Form styling patterns** - Input/select component consistency
- **Loading states** - Skeleton patterns (see SpendSummaryCard)
- **Error states** - Validation/error styling approach
- **Responsive patterns** - md: breakpoints and mobile-first guidelines
- **Animation/transitions** - Hover states and micro-interactions