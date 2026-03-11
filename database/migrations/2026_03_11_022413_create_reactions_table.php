<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('recommendation_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['fire', 'heart', 'mind_blown', 'skip']);
            $table->timestamps();
            
            $table->unique(['user_id', 'recommendation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
