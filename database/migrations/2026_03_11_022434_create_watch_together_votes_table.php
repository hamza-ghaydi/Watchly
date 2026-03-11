<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watch_together_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('watch_together_rooms')->onDelete('cascade');
            $table->foreignId('movie_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote', ['up', 'down']);
            $table->timestamps();
            
            $table->unique(['room_id', 'movie_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watch_together_votes');
    }
};
