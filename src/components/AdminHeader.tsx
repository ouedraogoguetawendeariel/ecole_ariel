import { useNavigate } from 'react-router-dom';

type AdminHeaderProps = {
    titre: string;
    sousTitre?: string;
    boutonPrincipal?: { label: string; onClick: () => void };
    masquerRetour?: boolean;
    boutonDeconnexion?: boolean;
};

export default function AdminHeader({
    titre,
    sousTitre,
    boutonPrincipal,
    masquerRetour,
    boutonDeconnexion,
}: AdminHeaderProps) {
    const navigate = useNavigate();

    const deconnexion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/connexion');
    };

    return (
        <header className="admin-eleves-header">
            <div>
                <h1>{titre}</h1>
                {sousTitre && <p>{sousTitre}</p>}
            </div>

            <div className="admin-eleves-header-buttons">
                {boutonPrincipal && (
                    <button onClick={boutonPrincipal.onClick}>{boutonPrincipal.label}</button>
                )}
                {boutonDeconnexion && <button onClick={deconnexion}>Déconnexion</button>}
                {!masquerRetour && (
                    <button onClick={() => navigate('/admin')}>← Retour</button>
                )}
            </div>
        </header>
    );
}
