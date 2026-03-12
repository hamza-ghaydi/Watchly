# Community Picks Sort Fix

## Problem
When clicking sort buttons (Most Recommended, Most Recent, Highest Rated) in Community Picks, the results don't update without refreshing the page.

## Root Cause
The `handleSort` function was using `preserveState: true` (default), which prevented Inertia from updating the component props with new data from the server.

## Solution
Changed `preserveState` to `false` to force Inertia to update the component with fresh data.

## Changes Made

### `resources/js/pages/Recommendations/Index.tsx`

**Before:**
```tsx
const handleSort = (newSort: string) => {
    router.get('/recommendations', { sort: newSort }, { 
        preserveScroll: true,
    });
};
```

**After:**
```tsx
const handleSort = (newSort: string) => {
    router.get('/recommendations', { sort: newSort }, { 
        preserveScroll: true,
        preserveState: false,
    });
};
```

## How It Works

- `preserveScroll: true` - Keeps the scroll position (good UX)
- `preserveState: false` - Forces component to re-render with new props (fixes the bug)

The `useEffect` hook already updates local state when recommendations change:
```tsx
useEffect(() => {
    setLocalRecs(recommendations.data);
}, [recommendations.data]);
```

But it wasn't being triggered because `preserveState: true` prevented the props from updating.

## Testing

1. Go to Community Picks page
2. Click "Most Recommended" button
3. Results should update immediately (no refresh needed)
4. Click "Most Recent" button
5. Results should update immediately
6. Click "Highest Rated" button
7. Results should update immediately
8. Scroll position should be maintained

## Benefits

- Instant feedback when sorting
- No need to refresh page
- Better user experience
- Scroll position preserved

## Technical Details

### Inertia.js Options

- `preserveScroll: true` - Maintains scroll position during navigation
- `preserveState: false` - Replaces component state with fresh server data
- `preserveState: true` (default) - Keeps existing component state

When `preserveState: true`, Inertia tries to be smart and only update changed props, but in this case we want a full update.

## Related Components

The fix works because:
1. User clicks sort button
2. `handleSort` makes GET request with new sort parameter
3. Server returns new sorted data
4. Inertia updates component props (because `preserveState: false`)
5. `useEffect` detects props change
6. Local state updates with new data
7. UI re-renders with sorted results
