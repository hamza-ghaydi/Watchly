<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'hamzaghaydi01@gmail.com',
            'password' => bcrypt('hamza@shiva#2001'),
            'role' => 'admin',
            'remember_token' => Str::random(10),
            'email_verified_at' => now(),
        ]);
    }
}