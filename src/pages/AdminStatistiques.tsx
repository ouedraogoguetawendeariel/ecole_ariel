import { useEffect, useState } from 'react';
import '../Css/AdminStatistiques.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

type StatistiquesEcole = {
    id: number;
    primaire_eleves: number;
    primaire_max_classe: number;
    primaire_niveaux: number;
    primaire_reussite_cep: string | number;
    college_eleves: number;
    college_max_classe: number;
    college_niveaux: number;
    college_reussite_bepc: string | number;
};

export default function AdminStatistiques() {
    const [statistiques, setStatistiques] =
        useState<StatistiquesEcole | null>(null);

    const [chargement, setChargement] = useState(true);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        chargerStatistiques();
    }, []);

    const chargerStatistiques = async () => {
        try {
            const res = await fetch(`${API_URL}/api/statistiques`);
            if (!res.ok) {
                throw new Error('Impossible de récupérer les statistiques.');
            }
            const data = await res.json();
            setStatistiques(data);
        } catch (error) {
            console.error(error);
            setErreur('Impossible de charger les statistiques.');
        } finally {
            setChargement(false);
        }
    };

    const modifierValeur = (champ: keyof StatistiquesEcole, valeur: string) => {
        if (!statistiques) return;
        setStatistiques({ ...statistiques, [champ]: valeur });
    };

    const enregistrer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!statistiques) return;

        setMessage('');
        setErreur('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErreur('Votre session a expiré. Veuillez vous reconnecter.');
                return;
            }

            const res = await fetch(`${API_URL}/api/statistiques`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    primaire_eleves: Number(statistiques.primaire_eleves),
                    primaire_max_classe: Number(statistiques.primaire_max_classe),
                    primaire_niveaux: Number(statistiques.primaire_niveaux),
                    primaire_reussite_cep: Number(statistiques.primaire_reussite_cep),
                    college_eleves: Number(statistiques.college_eleves),
                    college_max_classe: Number(statistiques.college_max_classe),
                    college_niveaux: Number(statistiques.college_niveaux),
                    college_reussite_bepc: Number(statistiques.college_reussite_bepc),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErreur(data.message || 'Erreur lors de la modification.');
                return;
            }

            setStatistiques(data.statistiques);
            setMessage('Les statistiques ont été mises à jour avec succès.');
        } catch (error) {
            console.error(error);
            setErreur('Impossible de contacter le serveur.');
        }
    };

    if (chargement) {
        return (
            <div className="admin-eleves">
                <AdminHeader titre="Gestion des statistiques" />
                <main className="admin-eleves-content">
                    <p>Chargement des statistiques...</p>
                </main>
            </div>
        );
    }

    if (!statistiques) {
        return (
            <div className="admin-eleves">
                <AdminHeader titre="Gestion des statistiques" />
                <main className="admin-eleves-content">
                    <p>Impossible de charger les statistiques.</p>
                    {erreur && <p className="message-erreur">{erreur}</p>}
                </main>
            </div>
        );
    }

    return (
        <div className="admin-eleves">
            <AdminHeader
                titre="Gestion des statistiques"
                sousTitre="Modifiez les informations affichées sur la page d'accueil de l'école."
            />

            <main className="admin-eleves-content">
                {message && <div className="message-succes">{message}</div>}
                {erreur && <div className="message-erreur">{erreur}</div>}

                <form onSubmit={enregistrer}>
                    <section className="statistiques-section">
                        <h2>🏫 École primaire</h2>
                        <div className="statistiques-form">
                            <div>
                                <label>Nombre d'élèves</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={statistiques.primaire_eleves}
                                    onChange={(e) => modifierValeur('primaire_eleves', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Élèves par classe maximum</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={statistiques.primaire_max_classe}
                                    onChange={(e) => modifierValeur('primaire_max_classe', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Nombre de niveaux</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={statistiques.primaire_niveaux}
                                    onChange={(e) => modifierValeur('primaire_niveaux', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Réussite au CEP (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={statistiques.primaire_reussite_cep}
                                    onChange={(e) => modifierValeur('primaire_reussite_cep', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="statistiques-section">
                        <h2>🎓 Collège</h2>
                        <div className="statistiques-form">
                            <div>
                                <label>Nombre d'élèves</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={statistiques.college_eleves}
                                    onChange={(e) => modifierValeur('college_eleves', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Élèves par classe maximum</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={statistiques.college_max_classe}
                                    onChange={(e) => modifierValeur('college_max_classe', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Nombre de niveaux</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={statistiques.college_niveaux}
                                    onChange={(e) => modifierValeur('college_niveaux', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Réussite au BEPC (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={statistiques.college_reussite_bepc}
                                    onChange={(e) => modifierValeur('college_reussite_bepc', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <button type="submit" className="btn-enregistrer-statistiques">
                        💾 Enregistrer les modifications
                    </button>
                </form>
            </main>
        </div>
    );
}
