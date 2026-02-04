# Dashboard Redesign Plan - QClay-Inspired Design System

## Design System Reference

### Colors
- **Background**: `#F5F5F4` (warm off-white)
- **Cards**: `bg-white` with `border-black/[0.04]` and `rounded-2xl`
- **Dark featured cards**: `bg-[#1C1C1C]` with white text
- **Muted insight cards**: Earth tones - `#E8E4DF`, `#DFE4E3`, `#E5E0D5`
- **Status green**: `text-emerald-600`, `bg-emerald-500`
- **Accent colors**: Purple, Blue, Amber, Violet (for icons/highlights)

### Typography
- **Large stats**: `text-3xl` or `text-4xl font-light` with `tracking-tight`
- **Section headers**: `text-base font-semibold text-foreground`
- **Labels**: `text-sm text-muted-foreground`
- **Small labels**: `text-xs text-muted-foreground`

### Components
- **Stat display**: Label above → Large number → Secondary info below (NO card wrapper)
- **Cards**: `bg-white rounded-2xl border border-black/[0.04]` with `hover:border-black/[0.08]`
- **Pills/Badges**: `rounded-full px-2.5 py-1 text-xs font-medium`
- **Action buttons**: `rounded-full bg-white border border-black/[0.06]` or `bg-[#1C1C1C] text-white`
- **List items**: Clean rows with colored icon boxes (`h-9 w-9 rounded-lg bg-{color}-50`)
- **Section dividers**: Simple `border-t border-black/[0.06]` or whitespace

### Layout Patterns
- **Header**: Inline stats left + Quick action pills right
- **Featured section**: Dark card with key data visualization
- **Content grid**: 2-3 columns with clear hierarchy
- **List cards**: White card with header bar + items + footer link

---

## Pages to Update (Grouped by Similarity)

### Group 1: Data List Pages (Complex - Use Convex queries)
1. **`/dashboard/signals/page.tsx`** - Signal list with filters, tabs, side panel
2. **`/dashboard/sources/page.tsx`** - Source list with stats, health metrics
3. **`/dashboard/mentions/page.tsx`** - Mentions feed with sentiment
4. **`/dashboard/subscribers/page.tsx`** - Subscriber list

**Pattern**:
- Compact stats row at top (no cards)
- Filter bar as pills
- Main list in white card
- Side panel for details

### Group 2: Analytics/Charts Pages
5. **`/dashboard/analytics/page.tsx`** - Charts and metrics

**Pattern**:
- Key metrics as inline stats
- Charts in white cards with minimal borders
- Grid layout for multiple visualizations

### Group 3: Content/Creation Pages
6. **`/dashboard/content-ideation/page.tsx`** - Wizard for content creation
7. **`/dashboard/content-library/page.tsx`** - Content asset list
8. **`/dashboard/content/page.tsx`** - Content overview
9. **`/dashboard/newsletters/page.tsx`** - Newsletter list
10. **`/dashboard/newsletters/create/page.tsx`** - Newsletter editor
11. **`/dashboard/newsletters/[id]/edit/page.tsx`** - Newsletter edit

**Pattern**:
- Wizard steps as clean horizontal pills
- Content cards with subtle borders
- Editor areas with minimal chrome

### Group 4: Team/User Pages
12. **`/dashboard/team/page.tsx`** - Team members list
13. **`/dashboard/team/[memberId]/page.tsx`** - Member detail

**Pattern**:
- Member cards with avatars
- Clean list layout

### Group 5: Settings Pages
14. **`/dashboard/settings/page.tsx`** - Settings redirect
15. **`/dashboard/settings/account/page.tsx`**
16. **`/dashboard/settings/organization/page.tsx`**
17. **`/dashboard/settings/newsletter/page.tsx`**
18. **`/dashboard/settings/billing/page.tsx`**
19. **`/dashboard/settings/api-keys/page.tsx`**
20. **`/dashboard/settings/notifications/page.tsx`**

**Pattern**:
- Simple form sections
- White cards for form groups
- Minimal visual noise

### Group 6: Other Pages
21. **`/dashboard/chat/page.tsx`** - Chat interface
22. **`/dashboard/maps/page.tsx`** - Innovation maps
23. **`/dashboard/admin/page.tsx`** - Admin panel
24. **`/dashboard/business-intelligence/page.tsx`**
25. **`/dashboard/business-intelligence/workflows/page.tsx`**

---

## Key Rules

1. **Preserve all Convex queries and mutations** - Don't change data fetching logic
2. **Remove `useSidebar` and fixed positioning** - Layout handles this now
3. **Use `min-h-screen` as root container** - Not fixed positioning
4. **Replace heavy Card components** - Use simple divs with new styling
5. **Remove icon boxes from headers** - Use simpler typography
6. **Replace Button components where possible** - Use native buttons with new styles
7. **Keep all existing functionality** - Just restyle the UI

---

## Implementation Order

### Phase 1: Core Data Pages (High Priority)
- Signals page
- Sources page
- Mentions page
- Analytics page

### Phase 2: Content Pages
- Content ideation
- Content library
- Newsletters

### Phase 3: Team & Settings
- Team pages
- All settings pages

### Phase 4: Remaining
- Chat, Maps, Admin, BI pages

---

## Common Replacements

### Before → After

```tsx
// OLD: Card with heavy styling
<Card className="bg-card border border-border">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>

// NEW: Clean card
<div className="bg-white rounded-2xl border border-black/[0.04] p-6">
  <h2 className="text-base font-semibold text-foreground mb-4">Title</h2>
  ...
</div>
```

```tsx
// OLD: Stats in cards
<div className="bg-card border rounded-lg p-5">
  <div className="h-8 w-8 bg-purple-500/20 rounded-lg">
    <Icon />
  </div>
  <span className="text-2xl font-bold">247</span>
  <span className="text-sm text-muted">Active Signals</span>
</div>

// NEW: Stats as typography
<div>
  <p className="text-sm text-muted-foreground mb-1">Active Signals</p>
  <p className="text-3xl font-light text-foreground">247</p>
  <p className="text-sm text-muted-foreground mt-1">
    <span className="text-emerald-600">+12</span> this week
  </p>
</div>
```

```tsx
// OLD: Heavy button
<Button className="bg-primary">
  <Icon /> Action
</Button>

// NEW: Clean pill button
<button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] text-sm">
  <Icon className="h-4 w-4" />
  Action
</button>
```

```tsx
// OLD: Fixed positioning with sidebar check
const { isCollapsed } = useSidebar();
<div className={cn("fixed right-0 top-0", isCollapsed ? "left-16" : "left-64")}>

// NEW: Simple container (layout handles positioning)
<div className="min-h-screen p-8">
```
