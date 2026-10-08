import { Linking } from 'react-native';
import { API_BASE_URL } from '../config';

// Versi aplikasi yang terpasang saat ini di HP pengguna
export const CURRENT_APP_VERSION = '1.0.0';

export async function checkAppUpdateAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/app-version`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { hasUpdate: false };

    const data = await res.json();
    const serverVersion = data.latest_version || CURRENT_APP_VERSION;

    // Bandingkan versi: jika versi server berbeda/lebih tinggi dari versi di HP
    const hasUpdate = serverVersion !== CURRENT_APP_VERSION;

    return {
      hasUpdate,
      latestVersion: serverVersion,
      downloadUrl: data.download_url || 'https://farid-peminjaman.alwaysdata.net',
      isMandatory: !!data.is_mandatory,
      notes: data.notes || 'Pembaruan versi terbaru telah tersedia.',
    };
  } catch (err) {
    return { hasUpdate: false };
  }
}

export function openUpdateLink(url) {
  if (url) {
    Linking.openURL(url).catch((err) => {
      console.warn('Gagal membuka link update:', err);
    });
  }
}
