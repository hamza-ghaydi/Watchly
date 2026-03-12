# Admin Users Page Pivot Column Fix

## Problem
Admin Users page was crashing with SQL error:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'pivot' in 'where clause'
```

## Root Cause
The `withCount` query was using `wherePivot('status', 'watched')` which generates incorrect SQL with `pivot` as a column name instead of the actual pivot table column `movie_user.status`.

## Solution
Changed from `wherePivot()` to `where()` with the full column name including the pivot table name.

## Changes Made

### `app/Http/Controllers/Admin/UserController.php`

**Before (Broken):**
```php
$users = User::withCount([
    'movies as watched_count' => fn ($query) => $query->wherePivot('status', 'watched'),
    'movies as to_watch_count' => fn ($query) => $query->wherePivot('status', 'to_watch'),
])
```

**After (Fixed):**
```php
$users = User::withCount([
    'movies as watched_count' => fn ($query) => $query->where('movie_user.status', 'watched'),
    'movies as to_watch_count' => fn ($query) => $query->where('movie_user.status', 'to_watch'),
])
```

## Why This Works

### The Problem with `wherePivot()`
`wherePivot()` is designed to work with relationship queries, not with `withCount()` subqueries. When used in `withCount()`, it generates invalid SQL:
```sql
-- WRONG (what wherePivot generates)
WHERE pivot = status

-- CORRECT (what we need)
WHERE movie_user.status = 'watched'
```

### The Solution with `where()`
Using `where('movie_user.status', 'watched')` explicitly specifies:
- `movie_user` - The pivot table name
- `status` - The column in the pivot table
- `'watched'` - The value to match

This generates correct SQL:
```sql
SELECT users.*, 
  (SELECT COUNT(*) FROM movies 
   INNER JOIN movie_user ON movies.id = movie_user.movie_id 
   WHERE users.id = movie_user.user_id 
   AND movie_user.status = 'watched') as watched_count
FROM users
```

## Testing

1. Go to Admin → Users page
2. Page should load without errors
3. Should see user list with watched/to-watch counts
4. Counts should be accurate

## Technical Details

### Pivot Table Structure
The `movie_user` pivot table has:
- `user_id` - Foreign key to users
- `movie_id` - Foreign key to movies
- `status` - Either 'watched' or 'to_watch'
- `watched_at` - Timestamp when marked as watched

### When to Use Each Method

| Method | Use Case |
|--------|----------|
| `wherePivot()` | When querying through a relationship (e.g., `$user->movies()->wherePivot()`) |
| `where()` | When using `withCount()` or raw queries |

### Example of Correct `wherePivot()` Usage
```php
// This works - querying through relationship
$user->movies()->wherePivot('status', 'watched')->get();

// This doesn't work - in withCount subquery
User::withCount([
    'movies' => fn($q) => $q->wherePivot('status', 'watched') // ❌ WRONG
]);

// This works - in withCount subquery
User::withCount([
    'movies' => fn($q) => $q->where('movie_user.status', 'watched') // ✅ CORRECT
]);
```

## Related Issues

This same pattern should be used anywhere you're counting pivot table records:
- Dashboard statistics
- User profiles
- Movie statistics
- Any `withCount()` with pivot conditions

## Benefits

- Admin Users page now loads correctly
- Accurate movie counts displayed
- No SQL errors
- Works with MySQL and other databases
