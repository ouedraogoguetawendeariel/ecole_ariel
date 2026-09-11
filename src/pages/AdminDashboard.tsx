import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AdminDashboard.css';

const API_URL = 'http://localhost:5000';

interface Statistiques {
    eleves: number;
    parents: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState<Statistiques>({
        eleves: 0,
        parents: 0,
    });

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/connexion');
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.role !== 'admin') {
                navigate('/tableau-de-bord');
                return;
            }

            const recupererStatistiques = async () => {
                try {
                    const res = await fetch(
                        `${API_URL}/api/admin/statistiques`,
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
                            'Impossible de récupérer les statistiques.'
                        );
                        return;
                    }

                    setStats({
                        eleves: data.eleves,
                        parents: data.parents,
                    });
                } catch {
                    setErreur(
                        'Impossible de contacter le serveur.'
                    );
                } finally {
                    setChargement(false);
                }
            };

            recupererStatistiques();

        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/connexion');
        }
    }, [navigate]);

    const deconnexion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/connexion');
    };

    return (
        <div className="admin-dashboard">

            <header className="admin-header">
                <div>
                    <h1>Administration</h1>
                    <p>Gestion du Complexe Scolaire</p>
                </div>

                <button onClick={deconnexion}>
                    Déconnexion
                </button>
            </header>

            <main className="admin-content">

                <div className="admin-welcome">
                    <h2>Tableau de bord administrateur</h2>
                    <p>
                        Gérez les élèves et les informations scolaires
                        depuis cet espace.
                    </p>
                </div>

                {erreur && (
                    <div className="admin-error">
                        {erreur}
                    </div>
                )}

                <section className="admin-stats">

                    <div className="admin-stat-card">
                        <span>👨‍🎓</span>
                        <div>
                            <h3>Élèves</h3>
                            <strong>
                                {chargement ? '...' : stats.eleves}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <span>👨‍👩‍👧</span>
                        <div>
                            <h3>Parents</h3>
                            <strong>
                                {chargement ? '...' : stats.parents}
                            </strong>
                        </div>
                    </div>

                </section>

                <section className="admin-actions">

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/eleves')}
                    >
                        <span>👨‍🎓</span>
                        <h3>Gestion des élèves</h3>
                        <p>
                            Consulter et gérer les élèves.
                        </p>
                    </button>

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/notes')}
                    >
                        <span>📊</span>
                        <h3>Résultats scolaires</h3>
                        <p>
                            Ajouter et gérer les notes.
                        </p>
                    </button>

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/devoirs')}
                    >
                        <span>📚</span>
                        <h3>Devoirs</h3>
                        <p>
                            Publier et gérer les devoirs.
                        </p>
                    </button>

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/absences')}
                    >
                        <span>🕐</span>
                        <h3>Absences</h3>
                        <p>
                            Gérer les absences et retards.
                        </p>
                    </button>

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/emploi-du-temps')}
                    >
                        <span>📅</span>
                        <h3>Emploi du temps</h3>
                        <p>
                            Gérer les horaires des classes.
                        </p>
                    </button>

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/bulletins')}
                    >
                        <span>📄</span>
                        <h3>Bulletins</h3>
                        <p>
                            Publier les bulletins scolaires.
                        </p>
                    </button>

                    <button
                        className="admin-action-card"
                        onClick={() => navigate('/admin/actualites')}
                    >
                        <span>📢</span>
                        <h3>Actualités</h3>
                        <p>
                            Publier les informations de l'école.
                        </p>
                    </button>

                </section>

            </main>
        </div>
    );
}