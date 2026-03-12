# Fixes Applied to Watchly

## Mobile Browser Session Persistence (March 12, 2026)

### Issue
Sessions not persisting on mobile Safari. Users get logged out immediately after login.

### Files Modified
- `config/session.php` - Auto-set secure cookies in production
- `.env.example` - Added SESSION_SECURE_COOKIE and SESSION_SAME_SITE
- `docker-entrypoint.sh` - Added sessions table creation
- `fix-production.sh` - Added session table migration step

### Changes
1. Set `secure=true` for production HTTPS
2. Set `same_site=none` for mobile Safari compatibility
3. Ensure sessions table exists in database
4. Updated deployment scripts

### Deployment
See `MOBILE_SESSION_FIX.md` for detailed deployment instructions.

---

## Avatar Storage Fix (March 12, 2026)

### Issue
Avatars not showing in incognito mode or after container restart.

### Solution
Moved from `public/avatars/` to `storage/app/public/avatars/` using Laravel Storage facade.

### Files Modified
- `app/Http/Controllers/Settings/ProfileController.php`
- `Dockerfile`
- `docker-entrypoint.sh`

See `AVATAR_FIX_GUIDE.md` for details.

---

## Fake Technology Signatures (March 12, 2026)

### Purpose
Fool Wappalyzer and security scanners by hiding real tech stack.

### Files Created
- `app/Http/Middleware/FakeTechSignatures.php`
- `public/wp-includes/version.php`
- `public/_next/static/chunks/webpack.js`
- `apache-security.conf`

See `FAKE_TECH_SIGNATURES_GUIDE.md` for details.

---

## Service Worker Navigation Fix (March 12, 2026)

### Issue
"Response served by service worker has redirections" error on mobile login.

### Solution
Updated service worker to not intercept navigation requests, POST requests, or non-GET requests.

### Files Modified
- `public/sw.js`
- `resources/views/app.blade.php`

---

## PWA Auto-Redirect to Dashboard (March 12, 2026)

### Feature
PWA users skip welcome page and go directly to dashboard.

### Files Modified
- `app/Http/Middleware/RedirectIfAuthenticated.php`
- `public/manifest.json`
- `routes/web.php`

---

## Mobile Navigation Black Page Fix (March 12, 2026)

### Issue
Black page showing on mobile navigation.

### Solution
Added body background styles and fixed viewport meta tag.

### Files Modified
- `resources/views/app.blade.php`
