<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount([
            'movies as watched_count' => fn ($query) => $query->where('movie_user.status', 'watched'),
            'movies as to_watch_count' => fn ($query) => $query->where('movie_user.status', 'to_watch'),
        ])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/UserForm', [
            'user' => null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:user,admin',
        ]);

        // Generate a unique username from name
        $baseUsername = strtolower(str_replace(' ', '', $request->name));
        $username = $baseUsername;
        $counter = 1;
        
        // Ensure username is unique
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'username' => $username,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/UserForm', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        // Cannot update yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['role' => 'You cannot change your own role or details here.']);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => 'required|in:user,admin',
        ]);

        // If name changed, regenerate username
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->name !== $user->name) {
            // Generate a unique username from name
            $baseUsername = strtolower(str_replace(' ', '', $request->name));
            $username = $baseUsername;
            $counter = 1;
            
            // Ensure username is unique (excluding current user)
            while (User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }
            
            $updateData['username'] = $username;
        }

        $user->update($updateData);

        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully!');
    }

    public function destroy(User $user)
    {
        // Cannot delete yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'You cannot delete yourself.']);
        }

        // Detach all movies
        $user->movies()->detach();

        // Delete orphaned movies
        $this->cleanupOrphanedMovies();

        $user->delete();

        return back()->with('success', 'User deleted successfully!');
    }

    private function cleanupOrphanedMovies(): void
    {
        // Delete movies that have no users
        \App\Models\Movie::doesntHave('users')->delete();
    }
}
