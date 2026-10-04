import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/TableauDeBord.css';

const API_URL = import.meta.env.VITE_API_URL;

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

    // Tous les enfants du parent
    const [enfants, setEnfants] = useState<Enfant[]>([]);

    // Enfant actuellement sélectionné
    const [enfantSelectionne, setEnfantSelectionne] =
        useState<Enfant | null>(null);

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

            // ==========================================
            // RÉCUPÉRER LES ENFANTS DU PARENT
            // ==========================================

            if (utilisateur.role === 'parent') {
                const recupererEnfants = async () => {
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
                                "Impossible de récupérer les informations des enfants."
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

                        // Enregistrer tous les enfants
                        setEnfants(data.enfants);

                        // Sélectionner automatiquement le premier
                        setEnfantSelectionne(data.enfants[0]);

                    } catch (error) {
                        console.error(error);

                        setErreur(
                            "Impossible de contacter le serveur."
                        );
                    }
                };

                recupererEnfants();
            }

        } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('token');

            navigate('/connexion');
        }
    }, [navigate]);

    // ==========================================
    // DÉCONNEXION
    // ==========================================

    const deconnexion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/connexion');
    };

    // ==========================================
    // CHARGEMENT
    // ==========================================

    if (!user) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="tableau-de-bord">

            {/* ==========================================
                EN-TÊTE
            ========================================== */}

            <header className="dashboard-header">

                <div>
                    <h1>Tableau de bord</h1>

                    <p>
                        Bienvenue{' '}
                        {user.prenom
                            ? `${user.prenom} ${user.nom}`
                            : user.nom}
                    </p>
                </div>

                <button onClick={deconnexion}>
                    Déconnexion
                </button>

            </header>


            <main className="dashboard-content">

                {/* ==========================================
                    ESPACE ÉLÈVE
                ========================================== */}

                {user.role === 'eleve' && (
                    <section className="profil-card">
                        
                        <h2>Mon espace scolaire</h2>

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

                    </section>
                )}


                {/* ==========================================
                    ESPACE PARENT
                ========================================== */}

                {user.role === 'parent' && (
                    <>

                        <section className="profil-card">

                            <h2>👨‍👩‍👧 Suivi de vos enfants</h2>

                            {erreur && enfants.length === 0 ? (
                                <p>{erreur}</p>
                            ) : (
                                <>
                                    <p>
                                        Sélectionnez l'enfant dont
                                        vous souhaitez consulter
                                        les informations.
                                    </p>

                                    {/* ==========================
                                        LISTE DES ENFANTS
                                    ========================== */}

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '10px',
                                            marginTop: '20px',
                                        }}
                                    >

                                        {enfants.map((enfant) => (
                                            <button
                                                key={enfant.id}
                                                onClick={() =>
                                                    setEnfantSelectionne(
                                                        enfant
                                                    )
                                                }
                                                style={{
                                                    padding: '12px 18px',
                                                    borderRadius: '8px',
                                                    border:
                                                        enfantSelectionne?.id ===
                                                        enfant.id
                                                            ? '2px solid #15324B'
                                                            : '1px solid #ccc',
                                                    background:
                                                        enfantSelectionne?.id ===
                                                        enfant.id
                                                            ? '#e8f0f7'
                                                            : '#fff',
                                                    cursor: 'pointer',
                                                    fontWeight:
                                                        enfantSelectionne?.id ===
                                                        enfant.id
                                                            ? 'bold'
                                                            : 'normal',
                                                }}
                                            >
                                                👤 {enfant.prenom}{' '}
                                                {enfant.nom}
                                            </button>
                                        ))}

                                    </div>
                                </>
                            )}

                        </section>


                        {/* ==========================================
                            INFORMATIONS ENFANT SÉLECTIONNÉ
                        ========================================== */}

                        {enfantSelectionne && (
                            <section className="profil-card">

                                <h2>
                                    🎓 Informations de l'élève
                                </h2>

                                <p>
                                    <strong>Élève :</strong>{' '}
                                    {enfantSelectionne.prenom}{' '}
                                    {enfantSelectionne.nom}
                                </p>

                                <p>
                                    <strong>
                                        Date de naissance :
                                    </strong>{' '}
                                    {new Date(
                                        enfantSelectionne.date_naissance
                                    ).toLocaleDateString('fr-FR')}
                                </p>

                                <p>
                                    <strong>Classe :</strong>{' '}
                                    {enfantSelectionne.classe}
                                </p>

                            </section>
                        )}

                    </>
                )}


                {/* ==========================================
                    MESSAGE D'ERREUR
                ========================================== */}

                {erreur &&
                    user.role === 'parent' &&
                    enfants.length === 0 && (
                        <section className="message-erreur">
                            {erreur}
                        </section>
                    )}


                {/* ==========================================
                    MENU DU TABLEAU DE BORD
                ========================================== */}

                <section className="dashboard-grid">

                    {/* RÉSULTATS */}

                    <button
                        className="dashboard-card"
                        onClick={() =>
                            navigate('/resultats')
                        }
                    >
                        <span>📊</span>

                        <h3>
                            Résultats scolaires
                        </h3>

                        <p>
                            Consulter les notes, moyennes et bulletins.
                        </p>
                    </button>


                    {/* DEVOIRS */}

                    <button
                        className="dashboard-card"
                        onClick={() =>
                            navigate('/devoirs')
                        }
                    >
                        <span>📚</span>

                        <h3>
                            Devoirs
                        </h3>

                        <p>
                            Consulter les devoirs.
                        </p>
                    </button>


                    {/* EMPLOI DU TEMPS */}

                                                            <button
                        className="dashboard-card"
                        onClick={() =>
                            navigate(
                                user.role === 'parent' && enfantSelectionne
                                    ? `/emploi-du-temps?classe=${encodeURIComponent(enfantSelectionne.classe)}`
                                    : '/emploi-du-temps'
                            )
                        }
                        disabled={user.role === 'parent' && !enfantSelectionne}
                    >
                        <span>📅</span>
                        <h3>
                            Emploi du temps
                        </h3>
                        <p>
                            Voir l'emploi du temps.
                        </p>
                    </button>


                    {/* ABSENCES */}

                    <button
                        className="dashboard-card"
                        onClick={() =>
                            navigate('/absences')
                        }
                    >
                        <span>🕐</span>

                        <h3>
                            Absences
                        </h3>

                        <p>
                            Consulter les absences et retards.
                        </p>
                    </button>


                    {/* ACTUALITÉS */}

                    {/* ACTUALITÉS UTILISATEUR */}

<button
    className="dashboard-card"
    onClick={() =>
        navigate('/actualites-utilisateur')
    }
>
    <span>🔔</span>

    <h3>
        Mes actualités
    </h3>

    <p>
        Les informations qui vous concernent.
    </p>
</button>


                    {/* PROFIL */}
        <button
  className="dashboard-card"
  onClick={() =>
    navigate(
      user.role === 'parent'
        ? '/profil-parent'
        : '/profil-eleve'
    )
  }
>
  <span>👤</span>
  <h3>Mon profil</h3>
  <p>Gérer les informations du compte.</p>
</button>

                 
                </section>

            </main>

        </div>
    );
}

