<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $availableLocales = array_keys((array) config('app.available_locales', []));

        $locale = $request->session()->get('locale');

        if (is_string($locale) && in_array($locale, $availableLocales, true)) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}
