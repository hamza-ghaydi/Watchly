<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watch_together_movies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('watch_together_rooms')->onDelete('cascade');
            $table->foreignId('movie_id')->constrained()->onDelete('cascade');
            $table->foreignId('added_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['to_watch', 'watched'])->default('to_watch');
            $table->json('meta')->nullable(); // For storing confirmation data
            $table->timestamp('watched_at')->nullable();
            $table->timestamps();
            
            $table->unique(['room_id', 'movie_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watch_together_movies');
    }
};
