<?php

namespace App\Services\Export;

use App\Models\MemoryExport;
use App\Models\User;

interface ExportServiceInterface
{
    public function createExport(User $user, array $params): MemoryExport;

    public function generateBookPdf(MemoryExport $export): string;
}
