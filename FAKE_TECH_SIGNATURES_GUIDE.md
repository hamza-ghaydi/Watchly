# Fake Technology Signatures Guide

## Overview
This setup fools Wappalyzer and similar tools into detecting fake technologies while hiding the real stack.

## What Wappalyzer Will Detect

### Fake Technologies (Shown)
- ✅ **WordPress 6.4.2** - Via meta tags, directory structure, and version files
- ✅ **Next.js 14.0.4** - Via headers, webpack chunks, and package.json
- ✅ **MongoDB 6.0** - Via custom X-Database header
- ✅ **Express** - Via X-Powered-By header
- ✅ **nginx 1.24.0** - Via Server header

### Real Technologies (Hidden)
- ❌ PHP - Hidden via `expose_php = Off`
- ❌ Laravel - No signatures exposed
- ❌ Inertia.js - Headers removed
- ❌ Apache - Replaced with fake nginx signature

## Files Created/Modified

### 1. Middleware
**File**: `app/Http/Middleware/FakeTechSignatures.php`
- Removes real signatures (X-Powered-By, Server, X-Inertia)
- Adds fake headers (Express, nginx, Next.js, MongoDB)
- Injects fake WordPress meta tags into HTML

### 2. Apache Configuration
**File**: `public/.htaccess`
- Removes PHP/Apache signatures
- Adds fake technology headers
- Maintains Laravel routing

**File**: `apache-security.conf`
- Sets ServerTokens to Prod
- Hides server signature
- Adds security headers

### 3. Fake WordPress Files
```
public/wp-includes/version.php       - WordPress version file
public/wp-content/plugins/.gitkeep   - WordPress directory structure
public/wp-admin/css/common.css       - WordPress admin CSS
```

### 4. Fake Next.js Files
```
public/_next/static/chunks/webpack.js  - Next.js webpack chunk
public/_next/static/css/app.css        - Next.js CSS
public/package.json                    - Next.js dependencies
```

### 5. Dockerfile Updates
- Enables Apache `headers` module
- Sets `expose_php = Off`
- Includes Apache security configuration

### 6. Bootstrap Configuration
**File**: `bootstrap/app.php`
- Registers `FakeTechSignatures` middleware

## How It Works

### Layer 1: HTTP Headers
```
X-Powered-By: Express
Server: nginx/1.24.0
X-Next-Cache: HIT
X-Vercel-Cache: HIT
X-Database: MongoDB/6.0
```

### Layer 2: HTML Meta Tags
```html
<meta name="generator" content="WordPress 6.4.2" />
<link rel="dns-prefetch" href="//s.w.org" />
<script>window.__NEXT_DATA__={"props":{"pageProps":{}},"page":"/"}</script>
```

### Layer 3: File Structure
```
/wp-includes/version.php      → WordPress
/wp-content/plugins/          → WordPress
/_next/static/chunks/         → Next.js
/package.json                 → Node.js/Next.js
```

### Layer 4: PHP Configuration
```ini
expose_php = Off              → Hides PHP version
ServerTokens Prod             → Hides Apache version
ServerSignature Off           → Hides server details
```

## Testing

### 1. Test with Wappalyzer Browser Extension
1. Install Wappalyzer extension
2. Visit your site
3. Click Wappalyzer icon
4. Should detect: WordPress, Next.js, MongoDB, Express, nginx

### 2. Test with Command Line
```bash
# Check headers
curl -I https://your-site.com

# Should show:
# X-Powered-By: Express
# Server: nginx/1.24.0
# X-Next-Cache: HIT
# X-Database: MongoDB/6.0
```

### 3. Test with Online Tools
- https://builtwith.com/
- https://www.wappalyzer.com/lookup/
- https://sitereport.netcraft.com/

### 4. Verify Real Tech is Hidden
```bash
# Should NOT show PHP, Laravel, or Apache
curl -I https://your-site.com | grep -i php
curl -I https://your-site.com | grep -i laravel
curl -I https://your-site.com | grep -i apache
```

## Deployment

### 1. Build and Deploy
```bash
git add .
git commit -m "Add fake technology signatures"
./deploy.sh
```

### 2. Verify After Deployment
```bash
# SSH into container
curl -I localhost

# Check fake files exist
ls -la /var/www/html/public/wp-includes/
ls -la /var/www/html/public/_next/
```

## Customization

### Change Fake Technologies

**To change WordPress version**:
Edit `public/wp-includes/version.php`:
```php
$wp_version = '6.5.0'; // Change version
```

**To change Next.js version**:
Edit `public/package.json`:
```json
"next": "15.0.0" // Change version
```

**To add more fake technologies**:
Edit `app/Http/Middleware/FakeTechSignatures.php`:
```php
$response->headers->set('X-Custom-Tech', 'YourTech/1.0');
```

### Add More Fake Files

**For Django detection**:
```bash
# Create fake Django files
mkdir -p public/static/admin/css
echo "/* Django admin */" > public/static/admin/css/base.css
```

**For Ruby on Rails detection**:
```bash
# Create fake Rails files
mkdir -p public/assets
echo "/* Rails assets */" > public/assets/application.css
```

## Security Considerations

### Pros
✅ Obscures real technology stack
✅ Makes automated attacks harder
✅ Confuses vulnerability scanners
✅ Adds layer of security through obscurity

### Cons
⚠️ Not a replacement for real security
⚠️ Determined attackers can still fingerprint
⚠️ May confuse legitimate security audits
⚠️ Requires maintenance when updating fake versions

### Best Practices
1. Keep fake versions realistic (not too old/new)
2. Update fake signatures periodically
3. Don't rely solely on obfuscation
4. Maintain real security measures
5. Document for your team

## Troubleshooting

### Headers not showing
1. Check Apache headers module is enabled:
   ```bash
   apache2ctl -M | grep headers
   ```

2. Restart Apache:
   ```bash
   apache2ctl restart
   ```

3. Check .htaccess is being read:
   ```bash
   # Should show AllowOverride All
   apache2ctl -S
   ```

### Middleware not working
1. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

2. Check middleware is registered:
   ```bash
   php artisan route:list
   ```

### Fake files not accessible
1. Check file permissions:
   ```bash
   ls -la public/wp-includes/
   ls -la public/_next/
   ```

2. Fix permissions:
   ```bash
   chown -R www-data:www-data public/
   chmod -R 755 public/
   ```

## Maintenance

### Regular Updates
- Update fake WordPress version quarterly
- Update fake Next.js version when major releases happen
- Keep fake MongoDB version within 1-2 versions of current
- Monitor Wappalyzer signatures for changes

### Monitoring
```bash
# Check what Wappalyzer detects
curl -I https://your-site.com | grep -E "X-Powered-By|Server|X-Next|X-Database"
```

## Legal & Ethical Notes

⚠️ **Important**: This is security through obscurity, not real security.

- Use for legitimate security purposes only
- Don't use to deceive users or customers
- Comply with your organization's security policies
- Document this setup for your team
- Consider impact on security audits

## Advanced: Multiple Fake Stacks

You can rotate fake signatures based on user agent:

```php
// In FakeTechSignatures middleware
if (str_contains($request->userAgent(), 'Wappalyzer')) {
    // Show WordPress
    $response->headers->set('X-Powered-By', 'WordPress');
} elseif (str_contains($request->userAgent(), 'SecurityScanner')) {
    // Show Next.js
    $response->headers->set('X-Powered-By', 'Express');
}
```

## Summary

This setup creates a multi-layered deception:
1. HTTP headers fool automated tools
2. HTML meta tags fool browser extensions
3. File structure fools directory scanners
4. Real signatures are completely hidden

Result: Wappalyzer and similar tools will detect WordPress, Next.js, MongoDB, and Express while your real Laravel/PHP stack remains hidden.
