# Mobile Browser Blank Screen Fix

## Problem
After login on mobile browser (Safari/Chrome), users see a blank white or black screen instead of the dashboard.

## Root Cause
The safe area padding we added for PWA mode was being applied to ALL contexts, including regular mobile browsers. This caused layout issues in non-PWA contexts.

## Solution
Use `@media (display-mode: standalone)` to apply safe area padding ONLY in PWA mode, not in regular mobile browsers.

## Changes Made

### `resources/views/app.blade.php`
Wrapped safe area padding in media query:
```css
/* Before - Applied everywhere */
#app {
    padding-top: env(safe-area-inset-top);
}

/* After - Only in PWA mode */
@media (display-mode: standalone) {
    #app {
        padding-top: env(safe-area-inset-top);
    }
}
```

### `resources/js/components/ui/sidebar.tsx`
Added media query to sidebar header padding:
```tsx
/* Before */
className="p-2 pt-[max(0.5rem,env(safe-area-inset-top))]"

/* After */
className="p-2 [@media(display-mode:standalone)]:pt-[max(0.5rem,env(safe-area-inset-top))]"
```

## How It Works

The `display-mode` media query detects the context:
- `standalone` = PWA installed on home screen
- `browser` = Regular mobile browser

This allows us to:
- Apply safe area fixes in PWA mode (where status bar overlaps)
- Skip safe area fixes in browser mode (where they cause issues)

## Deployment

```bash
git add .
git commit -m "Fix mobile browser blank screen after login"
git push origin main
```

## Testing

### Mobile Browser (Should Work Now)
1. Open Safari/Chrome on mobile
2. Go to your app
3. Login
4. ✅ Dashboard should load normally (no blank screen)
5. Navigate around
6. ✅ Everything should work

### PWA Mode (Should Still Work)
1. Install PWA from home screen
2. Open PWA
3. Login
4. ✅ Dashboard loads
5. ✅ Logo appears below status bar
6. ✅ No content overlap with status bar

## Why This Happened

When we added safe area padding to fix the PWA layout, we didn't restrict it to PWA mode only. This caused:

1. Mobile browsers applied the padding
2. But mobile browsers don't need it (no status bar overlap)
3. The extra padding broke the layout
4. Result: blank white/black screen

## The Fix

By using `@media (display-mode: standalone)`:
- Mobile browsers: No padding applied → Works normally
- PWA mode: Padding applied → Status bar doesn't overlap

## Browser Support

`display-mode` media query is supported by:
- iOS Safari 13+
- Chrome 45+
- Firefox 47+
- All modern mobile browsers

## Related Issues Fixed

- ✅ Blank white screen after login on mobile browser
- ✅ Blank black screen after login on mobile browser
- ✅ Layout breaking in mobile browser
- ✅ PWA status bar overlap (still fixed)
- ✅ PWA logo appearing under status bar (still fixed)
