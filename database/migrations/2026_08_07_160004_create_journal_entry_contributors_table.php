<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entry_contributors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('contributor');
            $table->timestamps();

            $table->unique(['journal_entry_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entry_contributors');
    }
};
