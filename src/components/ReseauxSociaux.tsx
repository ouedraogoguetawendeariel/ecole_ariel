import { Mail, Phone } from 'lucide-react';

export const RESEAUX = [
    { nom: 'Facebook', url: 'https://facebook.com/ecoleguetawende' },
    { nom: 'Instagram', url: 'https://instagram.com/ecoleguetawende' },
    { nom: 'TikTok', url: 'https://tiktok.com/@ecoleguetawende' },
    { nom: 'WhatsApp', url: 'https://wa.me/22670305882' },
    { nom: 'Email', url: 'mailto:contact@ecole-guetawende.bf' },
    { nom: 'Téléphone', url: 'tel:+22670305882' },
];

function IconeReseau({ nom }: { nom: string }) {
    if (nom === 'Facebook') {
        return (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
            </svg>
        );
    }
    if (nom === 'Instagram') {
        return (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
        );
    }
    if (nom === 'TikTok') {
        return (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M16.5 3c.4 2.2 1.9 3.7 4 4v3c-1.5 0-2.9-.4-4-1.2v6.6c0 3.7-3 6.6-6.6 6.6S3.3 19.1 3.3 15.4 6.3 8.8 10 8.8c.4 0 .7 0 1 .1v3.2a3.3 3.3 0 1 0 2.3 3.1V3h3.2z" />
            </svg>
        );
    }
    if (nom === 'WhatsApp') {
        return (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.5-.7-2.4-1.3-3.4-2.9-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5-.1-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.4c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.5-.3z" />
            </svg>
        );
    }
    if (nom === 'Email') {
        return <Mail size={18} />;
    }
    if (nom === 'Téléphone') {
        return <Phone size={18} />;
    }
    return null;
}

export default function ReseauxSociaux({ className = 'reseaux-liste' }: { className?: string }) {
    return (
        <div className={className}>
            {RESEAUX.map(function (r) {
                const isDirect = r.nom === 'Email' || r.nom === 'Téléphone';
                return (
                    <a
                        key={r.nom}
                        href={r.url}
                        target={isDirect ? undefined : '_blank'}
                        rel={isDirect ? undefined : 'noopener noreferrer'}
                        className="reseau-icone"
                        aria-label={r.nom}
                    >
                        <IconeReseau nom={r.nom} />
                    </a>
                );
            })}
        </div>
    );
}