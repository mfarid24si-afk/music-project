<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AdminAuthController extends Controller
{
    /**
     * Show admin login form.
     */
    public function showLogin(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login');
    }

    /**
     * Handle admin login request.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $remember = $request->boolean('remember');

        try {
            if (Auth::attempt($credentials, $remember)) {
                $user = Auth::user();

                // If user table has a role column, ensure regular users cannot access admin dashboard
                if (isset($user->role) && strtolower((string) $user->role) === 'user') {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return back()->withErrors([
                        'email' => 'Akun ini terdaftar sebagai Pengguna Biasa, bukan Administrator.',
                    ])->onlyInput('email');
                }

                $request->session()->regenerate();

                return redirect()->intended(route('admin.dashboard'))
                    ->with('success', 'Selamat datang kembali di Dashboard Admin, '.$user->name.'!');
            }
        } catch (\Throwable $e) {
            return back()->with('error', 'Koneksi database bermasalah: '.$e->getMessage())->withInput();
        }

        return back()->withErrors([
            'email' => 'Email atau password yang Anda masukkan tidak sesuai.',
        ])->onlyInput('email');
    }

    /**
     * Handle admin logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')
            ->with('info', 'Anda telah berhasil keluar dari Dashboard Admin.');
    }
}
