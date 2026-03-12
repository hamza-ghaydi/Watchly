# PWA Safe Area Fix

## Problem
Content appearing under the iOS status bar (time, battery, signal) in PWA mode, including the logo in the sidebar. Also causing blank white screen in mobile browser after login.

## Solution
Added CSS safe area insets that ONLY apply in PWA standalone mode, not in regular mobile browsers.

## Changes Made

### 1. `resources/views/app.blade.php`
Added safe area padding to the `#app` container, but ONLY in PWA mode:
```css
@media (display-mode: standalone) {
    #app {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
    }
}
```

### 2. `resources/js/components/ui/sidebar.tsx`
Added safe area padding to the `SidebarHeader` component, but ONLY in PWA mode:
```tsx
className={cn("flex flex-col gap-2 p-2 [@media(display-mode:standalone)]:pt-[max(0.5rem,env(safe-area-inset-top))]", className)}
```

## Why `@media (display-mode: standalone)`?

This media query detects if the app is running in PWA mode (installed on home screen) vs regular mobile browser:
- **PWA mode**: Applies safe area padding to avoid status bar overlap
- **Mobile browser**: No padding applied, works normally

This prevents the blank white screen issue in mobile browsers while still fixing the PWA layout.

## How It Works

- `@media (display-mode: standalone)` - Only applies styles in PWA mode
- `env(safe-area-inset-top)` - Adds padding for the status bar area (PWA only)
- `env(safe-area-inset-bottom)` - Adds padding for the home indicator area (PWA only)
- `max(0.5rem, env(safe-area-inset-top))` - Uses the larger value between 0.5rem and the safe area inset

## Deployment

1. Deploy the code:
   ```bash
   git add .
   git commit -m "Fix PWA safe area padding (PWA only, not mobile browser)"
   git push origin main
   ```

2. Test in mobile browser:
   - Open Safari/Chrome on mobile
   - Login
   - Should see dashboard normally (no blank screen)

3. Test in PWA:
   - Delete PWA from home screen
   - Clear Safari/Chrome data
   - Reinstall PWA
   - Logo should appear below status bar

## Testing Checklist

### Mobile Browser (Safari/Chrome)
- [ ] Login page works
- [ ] After login, dashboard loads (no blank screen)
- [ ] Navigation works
- [ ] Content displays properly

### PWA Mode
- [ ] Status bar visible and not overlapping content
- [ ] Logo in sidebar appears below status bar
- [ ] Header appears below status bar
- [ ] Bottom navigation (if any) above home indicator
- [ ] Content scrolls properly
- [ ] Works on iPhone with notch
- [ ] Works on iPhone without notch

## Technical Details

The `display-mode` media query is supported by:
- iOS Safari 13+
- Chrome 45+
- All modern mobile browsers

It specifically detects when the app is running as an installed PWA vs a regular web page.

## Why This Fix Was Needed

The original fix applied safe area padding to ALL contexts (browser + PWA), which caused:
- Blank white screen in mobile browsers after login
- Layout breaking in non-PWA contexts

By using `@media (display-mode: standalone)`, we ensure:
- Mobile browsers work normally
- PWA gets proper safe area handling
- No layout conflicts
