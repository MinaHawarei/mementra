<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    /**
     * Display the Privacy Policy page.
     */
    public function privacyPolicy(): Response
    {
        return Inertia::render('legal/privacy-policy', [
            'lastUpdated' => 'November 10, 2026',
        ]);
    }

    /**
     * Display the Terms of Service page.
     */
    public function terms(): Response
    {
        return Inertia::render('legal/terms', [
            'lastUpdated' => 'November 10, 2026',
        ]);
    }
}
