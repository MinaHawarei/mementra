<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->index(['user_id', 'entry_date', 'is_private'], 'idx_journal_user_date_private');
        });

        Schema::table('memory_shares', function (Blueprint $table) {
            $table->index(['target_user_id', 'revoked_at', 'starts_at', 'ends_at'], 'idx_shares_lookup');
        });
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex('idx_journal_user_date_private');
        });

        Schema::table('memory_shares', function (Blueprint $table) {
            $table->dropIndex('idx_shares_lookup');
        });
    }
};
