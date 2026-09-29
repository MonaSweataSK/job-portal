export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const maxFileSize = 5 * 1024 * 1024;
export const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];
