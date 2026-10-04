import { useEffect, useState } from 'react';
import '../Css/AdminAnneesScolaires.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

type AnneeScolaire = {
    id: number;
    libelle: string;
    active: boolean;
    premier_versement: string | null;
    deuxieme_versement: string | null;
    troisieme_versement: string | null;
    created_at: string;
};

export default function AdminAnneesScolaires() {
    const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
    const [libelle, setLibelle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const [echeances, setEcheances] = useState<{
        [id: number]: {
            premier_versement: string;
            deuxieme_versement: string;
            troisieme_versement: string;
        };
    }>({});

    const [enregistrement, setEnregistrement] = useState<number | null>(null);

    // ============================================================
    // CHARGER LES ANNÉES SCOLAIRES
    // ============================================================

    const chargerAnnees = async () => {
        try {
            const response = await fetch(`${API_URL}/api/anneesScolaires`);

            if (!response.ok) {
                throw new Error('Erreur lors du chargement');
            }

            const data = await response.json();

            setAnnees(data);

            // Charger les échéances dans les champs
            const nouvellesEcheances: {
                [id: number]: {
                    premier_versement: string;
                    deuxieme_versement: string;
                    troisieme_versement: string;
                };
            } = {};

            data.forEach((annee: AnneeScolaire) => {
                nouvellesEcheances[annee.id] = {
                    premier_versement: annee.premier_versement
                        ? annee.premier_versement.substring(0, 10)
                        : '',

                    deuxieme_versement: annee.deuxieme_versement
                        ? annee.deuxieme_versement.substring(0, 10)
                        : '',

                    troisieme_versement: annee.troisieme_versement
                        ? annee.troisieme_versement.substring(0, 10)
                        : '',
                };
            });

            setEcheances(nouvellesEcheances);
        } catch (error) {
            console.error(error);
            setMessage('Impossible de charger les années scolaires.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerAnnees();
    }, []);

    // ============================================================
    // AJOUTER UNE ANNÉE SCOLAIRE
    // ============================================================

    const ajouterAnnee = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!libelle.trim()) {
            setMessage('Veuillez saisir une année scolaire.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/anneesScolaires`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    libelle: libelle.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Erreur lors de l’ajout.');
                return;
            }

            setMessage('Année scolaire ajoutée avec succès.');
            setLibelle('');

            chargerAnnees();
        } catch (error) {
            console.error(error);
            setMessage('Erreur de connexion au serveur.');
        }
    };

    // ============================================================
    // MODIFIER UNE DATE D'ÉCHÉANCE
    // ============================================================

    const modifierEcheance = (
        id: number,
        champ: 'premier_versement' | 'deuxieme_versement' | 'troisieme_versement',
        valeur: string
    ) => {
        setEcheances((ancien) => ({
            ...ancien,
            [id]: {
                ...ancien[id],
                [champ]: valeur
            }
        }));
    };

    // ============================================================
    // ENREGISTRER LES ÉCHÉANCES
    // ============================================================

    const enregistrerEcheances = async (id: number) => {
        const dates = echeances[id];

        if (!dates) {
            setMessage('Les échéances sont introuvables.');
            return;
        }

        if (
            !dates.premier_versement ||
            !dates.deuxieme_versement ||
            !dates.troisieme_versement
        ) {
            setMessage(
                'Veuillez renseigner les trois dates d’échéance.'
            );
            return;
        }

        // Vérifier l'ordre des échéances
        if (
            dates.deuxieme_versement < dates.premier_versement ||
            dates.troisieme_versement < dates.deuxieme_versement
        ) {
            setMessage(
                'Les échéances doivent être dans l’ordre chronologique.'
            );
            return;
        }

        setEnregistrement(id);
        setMessage('');

        try {
            const response = await fetch(
                `${API_URL}/api/anneesScolaires/${id}/echeances`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        premier_versement: dates.premier_versement,
                        deuxieme_versement: dates.deuxieme_versement,
                        troisieme_versement: dates.troisieme_versement
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    'Erreur lors de l’enregistrement des échéances.'
                );
                return;
            }

            setMessage(
                `Les échéances de ${data.annee.libelle} ont été enregistrées avec succès.`
            );

            chargerAnnees();
        } catch (error) {
            console.error(error);
            setMessage('Erreur de connexion au serveur.');
        } finally {
            setEnregistrement(null);
        }
    };

    // ============================================================
    // ACTIVER UNE ANNÉE
    // ============================================================

    const activerAnnee = async (id: number) => {
        const confirmation = window.confirm(
            'Voulez-vous vraiment définir cette année comme année scolaire active ?'
        );

        if (!confirmation) return;

        try {
            const response = await fetch(
                `${API_URL}/api/anneesScolaires/${id}/activer`,
                {
                    method: 'PUT'
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    'Erreur lors de l’activation.'
                );
                return;
            }

            setMessage(
                'Année scolaire active modifiée avec succès.'
            );

            chargerAnnees();
        } catch (error) {
            console.error(error);
            setMessage('Erreur de connexion au serveur.');
        }
    };

    // ============================================================
    // AFFICHAGE
    // ============================================================

    return (
        <div className="admin-eleves">
            <AdminHeader
                titre="Gestion des années scolaires"
                sousTitre="Gérez les années scolaires de l'établissement, choisissez l'année active et définissez les échéances de paiement."
            />

            <main className="admin-eleves-content">

                {message && (
                    <div className="message-succes">
                        {message}
                    </div>
                )}

                {/* =====================================================
                    AJOUTER UNE ANNÉE
                ====================================================== */}

                <div className="annee-form">

                    <h2>Ajouter une année scolaire</h2>

                    <form onSubmit={ajouterAnnee}>

                        <div className="form-group">

                            <label htmlFor="libelle">
                                Année scolaire
                            </label>

                            <input
                                id="libelle"
                                type="text"
                                placeholder="Exemple : 2027-2028"
                                value={libelle}
                                onChange={(e) =>
                                    setLibelle(e.target.value)
                                }
                            />

                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            + Ajouter l'année
                        </button>

                    </form>

                </div>

                {/* =====================================================
                    LISTE DES ANNÉES
                ====================================================== */}

                <div className="annees-liste">

                    <h2>Années scolaires</h2>

                    {loading ? (
                        <p>Chargement...</p>

                    ) : annees.length === 0 ? (

                        <p>
                            Aucune année scolaire enregistrée.
                        </p>

                    ) : (

                        <div className="table-container">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Année scolaire
                                        </th>

                                        <th>
                                            Statut
                                        </th>

                                        <th>
                                            Échéances de paiement
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {annees.map((annee) => {

                                        const dates =
                                            echeances[annee.id] || {
                                                premier_versement: '',
                                                deuxieme_versement: '',
                                                troisieme_versement: ''
                                            };

                                        return (

                                            <tr key={annee.id}>

                                                {/* ANNÉE */}

                                                <td>

                                                    <strong>
                                                        {annee.libelle}
                                                    </strong>

                                                </td>

                                                {/* STATUT */}

                                                <td>

                                                    {annee.active ? (

                                                        <span className="badge-active">
                                                            ● Année active
                                                        </span>

                                                    ) : (

                                                        <span className="badge-inactive">
                                                            Année archivée / inactive
                                                        </span>

                                                    )}

                                                </td>

                                                {/* ÉCHÉANCES */}

                                                <td>

                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '10px',
                                                            minWidth: '230px'
                                                        }}
                                                    >

                                                        <div>

                                                            <label
                                                                htmlFor={`premier-${annee.id}`}
                                                                style={{
                                                                    display: 'block',
                                                                    marginBottom: '4px',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                1er versement
                                                            </label>

                                                            <input
                                                                id={`premier-${annee.id}`}
                                                                type="date"
                                                                value={
                                                                    dates.premier_versement
                                                                }
                                                                onChange={(e) =>
                                                                    modifierEcheance(
                                                                        annee.id,
                                                                        'premier_versement',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <div>

                                                            <label
                                                                htmlFor={`deuxieme-${annee.id}`}
                                                                style={{
                                                                    display: 'block',
                                                                    marginBottom: '4px',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                2ème versement
                                                            </label>

                                                            <input
                                                                id={`deuxieme-${annee.id}`}
                                                                type="date"
                                                                value={
                                                                    dates.deuxieme_versement
                                                                }
                                                                onChange={(e) =>
                                                                    modifierEcheance(
                                                                        annee.id,
                                                                        'deuxieme_versement',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <div>

                                                            <label
                                                                htmlFor={`troisieme-${annee.id}`}
                                                                style={{
                                                                    display: 'block',
                                                                    marginBottom: '4px',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                3ème versement
                                                            </label>

                                                            <input
                                                                id={`troisieme-${annee.id}`}
                                                                type="date"
                                                                value={
                                                                    dates.troisieme_versement
                                                                }
                                                                onChange={(e) =>
                                                                    modifierEcheance(
                                                                        annee.id,
                                                                        'troisieme_versement',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="btn-primary"
                                                            onClick={() =>
                                                                enregistrerEcheances(
                                                                    annee.id
                                                                )
                                                            }
                                                            disabled={
                                                                enregistrement ===
                                                                annee.id
                                                            }
                                                        >

                                                            {enregistrement ===
                                                            annee.id
                                                                ? 'Enregistrement...'
                                                                : '💾 Enregistrer les échéances'}

                                                        </button>

                                                    </div>

                                                </td>

                                                {/* ACTION */}

                                                <td>

                                                    {!annee.active && (

                                                        <button
                                                            type="button"
                                                            className="btn-activer"
                                                            onClick={() =>
                                                                activerAnnee(
                                                                    annee.id
                                                                )
                                                            }
                                                        >
                                                            Activer
                                                        </button>

                                                    )}

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}
