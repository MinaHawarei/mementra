<?php

namespace App\Providers;

use App\Services\Export\ExportServiceInterface;
use App\Services\Export\PdfExportService;
use App\Services\Storage\GoogleDriveMediaStorage;
use App\Services\Storage\LocalTestMediaStorage;
use App\Services\Storage\MediaStorageInterface;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            MediaStorageInterface::class,
            function () {
                if (config('services.google_drive.client_id')) {
                    return new GoogleDriveMediaStorage;
                }

                return new LocalTestMediaStorage;
            }
        );

        $this->app->bind(
            ExportServiceInterface::class,
            PdfExportService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        ini_set('upload_max_filesize', '20M');
        ini_set('post_max_size', '20M');
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
