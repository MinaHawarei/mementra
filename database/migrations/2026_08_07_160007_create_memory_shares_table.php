<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memory_shares', function (Blueprint $table) {
            $table->id();
            $table->string('resource_type')->default('journal_entry');
            $table->unsignedBigInteger('resource_id');
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('relationship_id')->nullable()->constrained('relationships')->cascadeOnDelete();
            $table->string('permission')->default('view');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['resource_type', 'resource_id']);
            $table->index(['owner_id', 'target_user_id']);
            $table->index(['relationship_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memory_shares');
    }
};
