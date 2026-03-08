<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('imdb_id')->unique();
            $table->string('title');
            $table->string('type'); // movie or series
            $table->integer('year')->nullable();
            $table->text('plot')->nullable();
            $table->string('poster')->nullable();
            $table->string('director')->nullable();
            $table->string('actors')->nullable();
            $table->string('genre')->nullable();
            $table->string('runtime')->nullable();
            $table->string('imdb_rating')->nullable();
            $table->json('ratings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
