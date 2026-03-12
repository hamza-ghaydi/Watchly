<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        // Update name and email first
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        
        // Update bio - handle it explicitly
        $user->bio = $request->input('bio', '');
        
        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && file_exists(public_path($user->avatar))) {
                @unlink(public_path($user->avatar));
            }
            
            $avatar = $request->file('avatar');
            
            // Ensure avatars directory exists
            $avatarDir = public_path('avatars');
            if (!file_exists($avatarDir)) {
                mkdir($avatarDir, 0775, true);
            }
            
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();
            
            // Move file with error handling
            try {
                $avatar->move($avatarDir, $filename);
                $user->avatar = '/avatars/' . $filename;
            } catch (\Exception $e) {
                Log::error('Avatar upload failed: ' . $e->getMessage());
                return back()->withErrors(['avatar' => 'Failed to upload avatar. Please try again.']);
            }
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Save all changes at once
        $saved = $user->save();
        
        Log::info('Profile save result', [
            'saved' => $saved,
            'user_id' => $user->id,
            'bio_in_model' => $user->bio,
            'avatar_in_model' => $user->avatar,
            'dirty_attributes' => $user->getDirty(),
        ]);

        return to_route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
