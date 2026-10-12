<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AdminUserController extends Controller
{
    /**
     * Store a newly created user with credentials.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:admin,user',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal terdiri dari 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        try {
            $userData = [
                'name' => strip_tags(trim($request->input('name'))),
                'email' => strtolower(trim($request->input('email'))),
                'password' => Hash::make($request->input('password')),
                'email_verified_at' => now(),
            ];

            if (Schema::hasColumn('users', 'role')) {
                $userData['role'] = $request->input('role', 'user');
            }

            $user = User::create($userData);

            return redirect()->route('admin.dashboard', ['tab' => 'users'])
                ->with('success', "Akun pengguna \"{$user->name}\" ({$user->email}) berhasil dibuat dan siap digunakan!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membuat pengguna: '.$e->getMessage())->withInput();
        }
    }

    /**
     * Delete an existing user account.
     */
    public function deleteUser(int|string $id): RedirectResponse
    {
        if ((int) Auth::id() === (int) $id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        try {
            $user = User::findOrFail($id);
            $name = $user->name;
            $user->delete();

            return redirect()->route('admin.dashboard', ['tab' => 'users'])
                ->with('success', "Akun pengguna \"{$name}\" berhasil dihapus dari sistem.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus pengguna: '.$e->getMessage());
        }
    }

    /**
     * Update an existing user account (name, email, optional password).
     */
    public function updateUser(Request $request, int|string $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        try {
            $user->name = strip_tags(trim((string) $request->input('name')));
            $user->email = strtolower(trim((string) $request->input('email')));

            if ($request->filled('password')) {
                $user->password = Hash::make($request->input('password'));
            }

            $user->save();

            return redirect()->route('admin.dashboard', ['tab' => 'users'])
                ->with('success', "Data akun pengguna \"{$user->name}\" ({$user->email}) berhasil diperbarui!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui pengguna: '.$e->getMessage());
        }
    }

    /**
     * Update admin profile name and email.
     */
    public function updateAdminProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
        ]);

        try {
            $user = Auth::user();
            $user->name = trim($request->input('name'));
            $user->email = trim($request->input('email'));
            $user->save();

            return redirect()->route('admin.dashboard', ['tab' => 'settings'])
                ->with('success', 'Profil administrator berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui profil: '.$e->getMessage());
        }
    }

    /**
     * Update admin password.
     */
    public function updateAdminPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = Auth::user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini salah.'])->withInput();
        }

        try {
            $user->password = Hash::make($request->input('new_password'));
            $user->save();

            return redirect()->route('admin.dashboard', ['tab' => 'settings'])
                ->with('success', 'Password administrator berhasil diubah.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal mengubah password: '.$e->getMessage());
        }
    }
}
