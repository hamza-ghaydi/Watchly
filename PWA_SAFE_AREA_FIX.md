# PWA Safe Area Fix

## Problem
Content appearing under the iOS status bar (time, battery, signal) in PWA mode.

## Solution
Added CSS safe area insets to push content below the status bar.

## Changes Made

### `resources/views/app.blade.php`
Added safe area padding to the `#app` container:
```css
#app {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
}
```

## How It Works

- `env(safe-area-inset-top)` - Adds padding for the status bar area
- `env(safe-area-inset-bottom)` - Adds padding for the home indicator area
- `env(safe-area-inset-left/right)` - Adds padding for notches/rounded corners

These CSS environment variables are provided by iOS and automatically adjust based on the device.

## Deployment

1. Deploy the code:
   ```bash
   git add .
   git commit -m "Fix PWA safe area padding"
   git push origin main
   ```

2. Clear PWA cache on mobile:
   - Delete the PWA from home screen
   - Clear Safari/Chrome data
   - Reinstall PWA

3. Test:
   - Open PWA
   - Content should appear below status bar
   - No overlap with time/battery/signal icons

## Testing Checklist

- [ ] Status bar visible and not overlapping content
- [ ] Header appears below status bar
- [ ] Bottom navigation (if any) above home indicator
- [ ] Content scrolls properly
- [ ] Works on iPhone with notch
- [ ] Works on iPhone without notch
- [ ] Works on iPad

## Technical Details

The viewport meta tag already includes `viewport-fit=cover`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

This allows the app to extend into the safe areas, and then we use CSS to add padding where needed.

## Alternative Approach (if needed)

If the above doesn't work, you can also add safe area padding to specific components:

```css
.header {
    padding-top: max(1rem, env(safe-area-inset-top));
}

.footer {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

The `max()` function ensures minimum padding even on devices without safe areas.
