import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AdminAdministrateurs.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Administrateur {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminAdministrateurs() {
    const navigate = useNavigate();

    const [administrateurs, setAdministrateurs] = useState<Administrateur[]>([]);
    const [chargement, setChargement] = useState(true);

    const [erreur, setErreur] = useState('');
    const [message, setMessage] = useState('');

    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [creationEnCours, setCreationEnCours] = useState(false);

    // ======================================================
    // RÉCUPÉRER LES ADMINISTRATEURS
    // ======================================================

    const recupererAdministrateurs = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/connexion');
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/api/admin/administrateurs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (res.status === 403) {
                navigate('/admin');
                return;
            }

            if (!res.ok) {
                setErreur(
                    data.message ||
                    'Impossible de récupérer les administrateurs.'
                );
                return;
            }

            setAdministrateurs(data.administrateurs || []);
        } catch {
            setErreur(
                'Impossible de contacter le serveur.'
            );
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        recupererAdministrateurs();
    }, []);

    // ======================================================
    // CRÉER UN ADMINISTRATEUR
    // ======================================================

    const creerAdministrateur = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setErreur('');
        setMessage('');

        if (
            !prenom.trim() ||
            !nom.trim() ||
            !email.trim() ||
            !password
        ) {
            setErreur(
                'Veuillez remplir tous les champs.'
            );
            return;
        }

        if (password.length < 6) {
            setErreur(
                'Le mot de passe doit contenir au moins 6 caractères.'
            );
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/connexion');
            return;
        }

        setCreationEnCours(true);

        try {
            const res = await fetch(
                `${API_URL}/api/admin/administrateurs`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        prenom: prenom.trim(),
                        nom: nom.trim(),
                        email: email.trim().toLowerCase(),
                        password,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setErreur(
                    data.message ||
                    'Impossible de créer l’administrateur.'
                );
                return;
            }

            setMessage(
                'Administrateur créé avec succès.'
            );

            setPrenom('');
            setNom('');
            setEmail('');
            setPassword('');

            await recupererAdministrateurs();
        } catch {
            setErreur(
                'Impossible de contacter le serveur.'
            );
        } finally {
            setCreationEnCours(false);
        }
    };

    // ======================================================
    // SUPPRIMER UN ADMINISTRATEUR
    // ======================================================

    const supprimerAdministrateur = async (
        id: number
    ) => {
        const confirmer = window.confirm(
            'Voulez-vous vraiment supprimer cet administrateur ?'
        );

        if (!confirmer) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/connexion');
            return;
        }

        setErreur('');
        setMessage('');

        try {
            const res = await fetch(
                `${API_URL}/api/admin/administrateurs/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setErreur(
                    data.message ||
                    'Impossible de supprimer l’administrateur.'
                );
                return;
            }

            setMessage(
                'Administrateur supprimé avec succès.'
            );

            await recupererAdministrateurs();
        } catch {
            setErreur(
                'Impossible de contacter le serveur.'
            );
        }
    };

    // ======================================================
    // ADMINISTRATEUR CONNECTÉ
    // ======================================================

    const utilisateurConnecte = JSON.parse(
        localStorage.getItem('user') || '{}'
    );

    const emailUtilisateur = String(
        utilisateurConnecte.email || ''
    )
        .trim()
        .toLowerCase();

    // ======================================================
    // RETOUR
    // ======================================================

    const retourDashboard = () => {
        navigate('/admin');
    };

    return (
        <div className="admin-administrateurs">

            <div className="admin-administrateurs-container">

                {/* ==================================================
                    EN-TÊTE
                ================================================== */}

                <header className="admin-administrateurs-header">

                    <div>
                        <h1>
                            Gestion des administrateurs
                        </h1>

                        <p>
                            Créer et gérer les administrateurs
                            de l'établissement.
                        </p>
                    </div>

                    <button
                        className="admin-retour-btn"
                        onClick={retourDashboard}
                    >
                        ← Retour au tableau de bord
                    </button>

                </header>


                {/* ==================================================
                    MESSAGES
                ================================================== */}

                {erreur && (
                    <div className="admin-message-erreur">
                        {erreur}
                    </div>
                )}

                {message && (
                    <div className="admin-message-succes">
                        {message}
                    </div>
                )}


                {/* ==================================================
                    CRÉATION D'UN ADMINISTRATEUR
                ================================================== */}

                <section className="admin-admin-card">

                    <h2>
                        Créer un administrateur
                    </h2>

                    <form
                        className="admin-admin-form"
                        onSubmit={creerAdministrateur}
                    >

                        <div className="admin-admin-form-grid">

                            <div className="admin-form-group">
                                <label htmlFor="prenom">
                                    Prénom
                                </label>

                                <input
                                    id="prenom"
                                    type="text"
                                    value={prenom}
                                    onChange={(e) =>
                                        setPrenom(e.target.value)
                                    }
                                    placeholder="Prénom"
                                />
                            </div>


                            <div className="admin-form-group">
                                <label htmlFor="nom">
                                    Nom
                                </label>

                                <input
                                    id="nom"
                                    type="text"
                                    value={nom}
                                    onChange={(e) =>
                                        setNom(e.target.value)
                                    }
                                    placeholder="Nom"
                                />
                            </div>


                            <div className="admin-form-group">
                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="email@exemple.com"
                                />
                            </div>


                            <div className="admin-form-group">
                                <label htmlFor="password">
                                    Mot de passe
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Minimum 6 caractères"
                                />
                            </div>

                        </div>


                        <button
                            type="submit"
                            className="admin-creer-btn"
                            disabled={creationEnCours}
                        >
                            {creationEnCours
                                ? 'Création en cours...'
                                : 'Créer l’administrateur'}
                        </button>

                    </form>

                </section>


                {/* ==================================================
                    LISTE DES ADMINISTRATEURS
                ================================================== */}

                <section className="admin-admin-card">

                    <h2>
                        Administrateurs
                    </h2>

                    {chargement ? (
                        <p className="admin-chargement">
                            Chargement des administrateurs...
                        </p>
                    ) : administrateurs.length === 0 ? (
                        <p className="admin-liste-vide">
                            Aucun administrateur trouvé.
                        </p>
                    ) : (

                        <div className="admin-table-container">

                            <table className="admin-admin-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Nom
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Rôle
                                        </th>

                                        <th>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {administrateurs.map(
                                        (admin) => {

                                            const estPrincipal =
                                                admin.email
                                                    .trim()
                                                    .toLowerCase() ===
                                                emailUtilisateur;

                                            return (
                                                <tr key={admin.id}>

                                                    <td>
                                                        {admin.prenom}{' '}
                                                        {admin.nom}
                                                    </td>

                                                    <td>
                                                        {admin.email}
                                                    </td>

                                                    <td>

                                                        {estPrincipal ? (
                                                            <span className="admin-role-principal">
                                                                Administrateur principal
                                                            </span>
                                                        ) : (
                                                            <span className="admin-role-secondaire">
                                                                Administrateur
                                                            </span>
                                                        )}

                                                    </td>

                                                    <td>

                                                        {estPrincipal ? (

                                                            <span className="admin-compte-principal">
                                                                Compte principal
                                                            </span>

                                                        ) : (

                                                            <button
                                                                className="admin-supprimer-btn"
                                                                onClick={() =>
                                                                    supprimerAdministrateur(
                                                                        admin.id
                                                                    )
                                                                }
                                                            >
                                                                Supprimer
                                                            </button>

                                                        )}

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>

        </div>
    );
}
