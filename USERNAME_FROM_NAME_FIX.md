# Username Generation Fix

## Change
Changed username generation to use the user's name instead of email.

## Files Modified

### 1. `app/Actions/Fortify/CreateNewUser.php`
**Before:** Username generated from email (e.g., `john@example.com` → `john`)
**After:** Username generated from name (e.g., `John Doe` → `johndoe`)

```php
// Old
$baseUsername = strtolower(explode('@', $input['email'])[0]);

// New
$baseUsername = strtolower(str_replace(' ', '', $input['name']));
```

### 2. `app/Http/Controllers/Admin/UserController.php`
**store() method:** Added username generation from name when admin creates users
**update() method:** Added username regeneration when admin updates user's name

## How It Works

1. Takes the user's name (e.g., "John Doe")
2. Converts to lowercase and removes spaces (e.g., "johndoe")
3. Checks if username exists
4. If exists, appends a number (e.g., "johndoe1", "johndoe2", etc.)
5. Saves the unique username

## Examples

| Name | Username |
|------|----------|
| John Doe | johndoe |
| Jane Smith | janesmith |
| John Doe (2nd user) | johndoe1 |
| Bob O'Brien | bobobrien |
| María García | maríagarcía |

## Testing

### New User Registration
1. Register with name "Test User"
2. Username should be "testuser"
3. Check profile - username should match name (lowercase, no spaces)

### Admin User Creation
1. Admin creates user with name "Admin Test"
2. Username should be "admintest"

### Admin User Update
1. Admin updates user's name from "John Doe" to "Jane Smith"
2. Username should update from "johndoe" to "janesmith"

### Duplicate Names
1. Register user "John Doe" → username "johndoe"
2. Register another "John Doe" → username "johndoe1"
3. Register third "John Doe" → username "johndoe2"

## Notes

- Existing users keep their current usernames
- Only new users or updated users get the new username format
- Usernames are always unique (enforced by database)
- Special characters in names are preserved (e.g., María, O'Brien)
- Spaces are removed from usernames

## Migration

No database migration needed - the username column already exists.

If you want to update existing users' usernames to match their names, run:

```php
php artisan tinker

// Update all users
User::all()->each(function($user) {
    $baseUsername = strtolower(str_replace(' ', '', $user->name));
    $username = $baseUsername;
    $counter = 1;
    
    while (User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
        $username = $baseUsername . $counter;
        $counter++;
    }
    
    $user->update(['username' => $username]);
});
```

This is optional and only needed if you want to update existing users.
