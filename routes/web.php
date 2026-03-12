<?php

use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\UserController as PublicUserController;
use App\Http\Controllers\WatchTogetherController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home')->middleware('guest');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Movie routes
    Route::get('movies/to-watch', [MovieController::class, 'toWatch'])->name('movies.to-watch');
    Route::get('movies/watched', [MovieController::class, 'watched'])->name('movies.watched');
    Route::get('movies/search', [MovieController::class, 'search'])->name('movies.search');
    Route::post('movies/import', [MovieController::class, 'import'])->name('movies.import');
    Route::post('movies/{movie}/mark-watched', [MovieController::class, 'markWatched'])->name('movies.mark-watched');
    Route::delete('movies/{movie}', [MovieController::class, 'destroy'])->name('movies.destroy');
    Route::post('movies/from-recommendation', [MovieController::class, 'addFromRecommendation'])->name('movies.from-recommendation');

    // Recommendations
    Route::get('recommendations', [RecommendationController::class, 'index'])->name('recommendations.index');
    Route::post('recommendations', [RecommendationController::class, 'store'])->name('recommendations.store');
    Route::delete('recommendations/{recommendation}', [RecommendationController::class, 'destroy'])->name('recommendations.destroy');
    Route::get('recommendations/{recommendation}/comments', [RecommendationController::class, 'getComments'])->name('recommendations.comments');
    Route::post('recommendations/{recommendation}/comments', [RecommendationController::class, 'storeComment'])->name('recommendations.comments.store');

    // Reactions
    Route::post('reactions/toggle', [ReactionController::class, 'toggle'])->name('reactions.toggle');

    // Watch Together
    Route::get('watch-together', [WatchTogetherController::class, 'index'])->name('watch-together.index');
    Route::post('watch-together', [WatchTogetherController::class, 'store'])->name('watch-together.store');
    Route::post('watch-together/join', [WatchTogetherController::class, 'join'])->name('watch-together.join');
    Route::get('watch-together/{room}', [WatchTogetherController::class, 'show'])->name('watch-together.show');
    Route::post('watch-together/{room}/add-movie', [WatchTogetherController::class, 'addMovie'])->name('watch-together.add-movie');
    Route::post('watch-together/{room}/vote', [WatchTogetherController::class, 'vote'])->name('watch-together.vote');
    Route::post('watch-together/{room}/mark-watched', [WatchTogetherController::class, 'markWatched'])->name('watch-together.mark-watched');
    Route::post('watch-together/{room}/leave', [WatchTogetherController::class, 'leave'])->name('watch-together.leave');
    Route::post('watch-together/{room}/invite', [WatchTogetherController::class, 'inviteUser'])->name('watch-together.invite');

    // Follow
    Route::post('users/{user}/follow', [FollowController::class, 'toggle'])->name('users.follow');

    // Feed
    Route::get('feed', [FeedController::class, 'index'])->name('feed.index');

    // Users
    Route::get('users', [PublicUserController::class, 'index'])->name('users.index');
    Route::get('users/{username}', [PublicUserController::class, 'show'])->name('users.show');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // Push Subscriptions
    Route::get('push/public-key', [App\Http\Controllers\PushSubscriptionController::class, 'getPublicKey'])->name('push.public-key');
    Route::post('push/subscribe', [App\Http\Controllers\PushSubscriptionController::class, 'store'])->name('push.subscribe');
    Route::post('push/unsubscribe', [App\Http\Controllers\PushSubscriptionController::class, 'destroy'])->name('push.unsubscribe');

    // Admin routes
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        // Settings
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('settings/test', [SettingsController::class, 'test'])->name('settings.test');

        // Users
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // Movies
        Route::get('movies/to-watch', [AdminMovieController::class, 'toWatch'])->name('movies.to-watch');
        Route::get('movies/watched', [AdminMovieController::class, 'watched'])->name('movies.watched');
    });
});

require __DIR__.'/settings.php';

