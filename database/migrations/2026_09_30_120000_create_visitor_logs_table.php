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
        if (! Schema::hasTable('visitor_logs')) {
            Schema::create('visitor_logs', function (Blueprint $table) {
                $table->id();
                $table->string('ip_hash', 64)->index();
                $table->string('path', 255)->default('/');
                $table->date('visit_date')->index();
                $table->unsignedTinyInteger('visit_hour')->index(); // 0 - 23
                $table->timestamps();

                $table->index(['visit_date', 'visit_hour'], 'idx_date_hour');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
