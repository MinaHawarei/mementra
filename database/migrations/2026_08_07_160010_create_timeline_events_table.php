<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timeline_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('relationship_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type');
            $table->date('event_date');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->nullableMorphs('eventable');
            $table->timestamps();

            $table->index(['user_id', 'event_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timeline_events');
    }
};
