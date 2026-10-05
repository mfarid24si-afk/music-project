<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * The admin route group only used the `auth` middleware, which verifies that
     * somebody is logged in but never that they are an administrator. That let a
     * regular signed-up user reach /admin by typing the URL directly, even though
     * AdminAuthController refuses to log them into the admin form.
     *
     * A user is blocked when their role is exactly `user`. When the column is
     * absent the account is treated as an administrator, matching the existing
     * checks in AdminAuthController and MusicController.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || $this->isRegularUser($user)) {
            abort(403, 'Halaman ini hanya untuk administrator.');
        }

        return $next($request);
    }

    private function isRegularUser(object $user): bool
    {
        return isset($user->role)
            && strtolower((string) $user->role) === 'user';
    }
}
