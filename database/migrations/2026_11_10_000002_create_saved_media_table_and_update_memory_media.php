<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('memory_media', function (Blueprint $table) {
            $table->foreignId('storage_connection_id')
                ->nullable()
                ->after('journal_entry_id')
                ->constrained('storage_connections')
                ->nullOnDelete();
        });

        Schema::create('saved_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('original_media_id')->nullable()->constrained('memory_media')->nullOnDelete();
            $table->foreignId('original_owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('storage_connection_id')->nullable()->constrained('storage_connections')->nullOnDelete();
            $table->string('provider')->default('google_drive');
            $table->string('provider_file_id');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');
            $table->json('metadata')->nullable();
            $table->timestamp('saved_at');
            $table->timestamps();

            $table->index(['user_id', 'original_media_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_media');

        Schema::table('memory_media', function (Blueprint $table) {
            $table->dropForeign(['storage_connection_id']);
            $table->dropColumn('storage_connection_id');
        });
    }
};
