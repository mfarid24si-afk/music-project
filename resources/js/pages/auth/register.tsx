import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Pendaftaran Ditutup" />
            <div className="flex flex-col gap-6 text-center">
                <div className="rounded-xl border border-border/40 bg-muted/30 p-6 text-sm text-muted-foreground">
                    Pendaftaran akun baru tidak dibuka untuk umum. Akun hanya dapat dibuat oleh Administrator Spotirid.
                </div>
                <div>
                    <TextLink href={login()}>Kembali ke Halaman Login</TextLink>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Pendaftaran Ditutup',
    description: 'Pendaftaran akun baru dikelola langsung oleh Administrator',
};
