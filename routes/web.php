<?php

use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MovieController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Movie routes
    Route::get('movies/to-watch', [MovieController::class, 'toWatch'])->name('movies.to-watch');
    Route::get('movies/watched', [MovieController::class, 'watched'])->name('movies.watched');
    Route::get('movies/search', [MovieController::class, 'search'])->name('movies.search');
    Route::post('movies/import', [MovieController::class, 'import'])->name('movies.import');
    Route::post('movies/{movie}/mark-watched', [MovieController::class, 'markWatched'])->name('movies.mark-watched');
    Route::delete('movies/{movie}', [MovieController::class, 'destroy'])->name('movies.destroy');

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

