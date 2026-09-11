import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/TableauDeBord.css';

const API_URL = 'http://localhost:5000';

interface User {
    id: number;
    role: 'parent' | 'eleve';
    nom: string;
    prenom?: string;
    email: string;
    classe?: string;
}

interface Enfant {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    classe: string;
    date_naissance: string;
}

export default function TableauDeBord() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [enfant, setEnfant] = useState<Enfant | null>(null);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/connexion');
            return;
        }

        try {
            const utilisateur: User = JSON.parse(userData);

            setUser(utilisateur);

            // Si c'est un parent, récupérer son enfant
            if (utilisateur.role === 'parent') {
                const recupererEnfant = async () => {
                    try {
                        const res = await fetch(
                            `${API_URL}/api/children`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        const data = await res.json();

                        if (!res.ok) {
                            setErreur(
                                data.message ||
                                "Impossible de récupérer les informations de l'enfant."
                            );
                            return;
                        }

                        if (
                            !data.enfants ||
                            data.enfants.length === 0
                        ) {
                            setErreur(
                                "Aucun enfant n'est associé à ce compte."
                            );
                            return;
                        }

                        // Pour l'instant, on récupère le premier enfant associé
                        setEnfant(data.enfants[0]);

                    } catch {
                        setErreur(
                            "Impossible de contacter le serveur."
                        );
                    }
                };

                recupererEnfant();
            }

        } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/connexion');
        }
    }, [navigate]);

    const deconnexion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/connexion');
    };

    if (!user) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="tableau-de-bord">

            <header className="dashboard-header">
                <div>
                    <h1>Tableau de bord</h1>

                    <p>
                        Bienvenue {user.prenom
                            ? ` ${user.prenom} ${user.nom}`
                            : user.nom}
                    </p>
                </div>

                <button onClick={deconnexion}>
                    Déconnexion
                </button>
            </header>

            <main className="dashboard-content">

                <section className="profil-card">

                    <h2>
                        {user.role === 'parent'
                            ? 'Suivi de votre enfant'
                            : 'Mon espace scolaire'}
                    </h2>

                    {/* INFORMATIONS DE L'ÉLÈVE */}
                    {user.role === 'eleve' && (
                        <>
                            <p>
                                <strong>Élève :</strong>{' '}
                                {user.prenom
                                    ? `${user.prenom} ${user.nom}`
                                    : user.nom}
                            </p>

                            {user.classe && (
                                <p>
                                    <strong>Classe :</strong>{' '}
                                    {user.classe}
                                </p>
                            )}
                        </>
                    )}

                    {/* INFORMATIONS DE L'ENFANT DU PARENT */}
                    {user.role === 'parent' && (
                        <>
                            {enfant ? (
                                <>
                                    <p>
                                        <strong>Élève :</strong>{' '}
                                        {enfant.prenom} {enfant.nom}
                                    </p>

                                    <p>
                                        <strong>Classe :</strong>{' '}
                                        {enfant.classe}
                                    </p>
                                </>
                            ) : (
                                <p>
                                    {erreur || 'Chargement des informations de votre enfant...'}
                                </p>
                            )}
                        </>
                    )}

                </section>

                {erreur && user.role === 'parent' && !enfant && (
                    <section className="message-erreur">
                        {erreur}
                    </section>
                )}

                <section className="dashboard-grid">

    <button
        className="dashboard-card"
        onClick={() => navigate('/resultats')}
    >
        <span>📊</span>
        <h3>Résultats scolaires</h3>
        <p>
            Consulter les notes et les moyennes.
        </p>
    </button>

    <button
        className="dashboard-card"
        onClick={() => navigate('/devoirs')}
    >
        <span>📚</span>
        <h3>Devoirs</h3>
        <p>
            Consulter les devoirs.
        </p>
    </button>

    <button
        className="dashboard-card"
        onClick={() => navigate('/emploi-du-temps')}
    >
        <span>📅</span>
        <h3>Emploi du temps</h3>
        <p>
            Voir l'emploi du temps.
        </p>
    </button>

    <button
        className="dashboard-card"
        onClick={() => navigate('/absences')}
    >
        <span>🕐</span>
        <h3>Absences</h3>
        <p>
            Consulter les absences et retards.
        </p>
    </button>

    <button
        className="dashboard-card"
        onClick={() => navigate('/actualites')}
    >
        <span>📢</span>
        <h3>Actualités</h3>
        <p>
            Les informations de l'école.
        </p>
    </button>

    <button
        className="dashboard-card"
        onClick={() => navigate('/profil')}
    >
        <span>👤</span>
        <h3>Mon profil</h3>
        <p>
            Gérer les informations du compte.
        </p>
    </button>

</section>
            </main>
        </div>
    );
}