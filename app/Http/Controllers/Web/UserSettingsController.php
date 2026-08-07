<?php

namespace App\Http\Controllers\Web;

use App\Enums\Locale;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserSettingsController extends Controller
{
    public function updatePreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', Rule::enum(Locale::class)],
            'timezone' => ['required', 'string', 'timezone'],
        ]);

        $request->user()->update($validated);

        return back();
    }
}
