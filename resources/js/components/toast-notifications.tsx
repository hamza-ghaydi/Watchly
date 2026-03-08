import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';

export function ToastNotifications() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    const showToast = (message: string, type: 'success' | 'error') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5 ${
            type === 'success'
                ? 'bg-green-900/90 text-green-100 border border-green-700'
                : 'bg-red-900/90 text-red-100 border border-red-700'
        }`;
        
        const icon = type === 'success' 
            ? '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        
        toast.innerHTML = `${icon}<span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-5');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    return null;
}
