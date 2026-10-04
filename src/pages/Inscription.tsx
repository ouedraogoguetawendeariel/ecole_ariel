import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../Css/Inscription.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Inscription() {
    const [searchParams] = useSearchParams();

    const typeParam = searchParams.get('type');

    const type =
        typeParam === 'parent' || typeParam === 'eleve'
            ? typeParam
            : 'eleve';

    // ==============================
    // INFORMATIONS UTILISATEUR
    // ==============================

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmation, setConfirmation] = useState('');

    // ==============================
    // INFORMATIONS ÉLÈVE
    // ==============================

    const [classe, setClasse] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');

    // ==============================
    // INFORMATIONS ENFANT DU PARENT
    // ==============================

    const [prenomEnfant, setPrenomEnfant] = useState('');
    const [nomEnfant, setNomEnfant] = useState('');
    const [classeEnfant, setClasseEnfant] = useState('');
    const [dateNaissanceEnfant, setDateNaissanceEnfant] = useState('');

    // ==============================
    // AUTRES
    // ==============================

    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);
    const [codeInscription, setCodeInscription] = useState('');

    const navigate = useNavigate();

    // ==============================
    // INSCRIPTION
    // ==============================

    const handleInscription = async (e: React.FormEvent) => {
        e.preventDefault();

        setErreur('');

        // Vérification mot de passe
        if (motDePasse !== confirmation) {
            setErreur('Les mots de passe ne correspondent pas.');
            return;
        }

        setChargement(true);

        try {
            const body =
                type === 'parent'
                    ? {
                          role: 'parent',
                          nom,
                          prenom,
                          email,
                          password: motDePasse,

                          // Informations de l'enfant
                          prenomEnfant,
                          nomEnfant,
                          classeEnfant,
                          dateNaissanceEnfant,

                          codeInscription,
                      }
                    : {
                          role: 'eleve',
                          nom,
                          prenom,
                          email,
                          password: motDePasse,

                          // Informations de l'élève
                          classe,
                          dateNaissance,

                          codeInscription,
                      };

            const res = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setErreur(
                    data.message ||
                        'Une erreur est survenue lors de l’inscription.'
                );
                return;
            }

            // ==============================
            // SAUVEGARDE DE LA CONNEXION
            // ==============================

            localStorage.setItem('token', data.token);

            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            );

            // ==============================
            // TABLEAU DE BORD
            // ==============================

            navigate('/tableau-de-bord');
        } catch (error) {
            console.error(error);

            setErreur(
                'Impossible de contacter le serveur. Vérifie qu’il est bien lancé.'
            );
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="inscription">
            <div className="inscription-box">

                <h1>
                    Créer un compte (
                    {type === 'parent'
                        ? 'Parent'
                        : 'Élève'}
                    )
                </h1>

                <p>
                    Inscrivez-vous pour accéder à votre espace scolaire
                </p>

                <form onSubmit={handleInscription}>

                    {/* ==============================
                        CODE D'INSCRIPTION
                    ============================== */}

                    <label>Code d'inscription</label>

                    <input
                        type="text"
                        placeholder="Code fourni par l'école"
                        value={codeInscription}
                        onChange={(e) =>
                            setCodeInscription(e.target.value)
                        }
                        required
                    />

                    {/* ==============================
                        INFORMATIONS PARENT / ÉLÈVE
                    ============================== */}

                    <label>Nom</label>

                    <input
                        type="text"
                        placeholder="Votre nom"
                        value={nom}
                        onChange={(e) =>
                            setNom(e.target.value)
                        }
                        required
                    />

                    <label>Prénom</label>

                    <input
                        type="text"
                        placeholder="Votre prénom"
                        value={prenom}
                        onChange={(e) =>
                            setPrenom(e.target.value)
                        }
                        required
                    />

                    {/* ==============================
                        INFORMATIONS ENFANT
                    ============================== */}

                    {type === 'parent' && (
                        <>
                            <h3 className="titre-enfant">
                                Informations de votre enfant
                            </h3>

                            <label>
                                Prénom de l'enfant
                            </label>

                            <input
                                type="text"
                                placeholder="Prénom de votre enfant"
                                value={prenomEnfant}
                                onChange={(e) =>
                                    setPrenomEnfant(e.target.value)
                                }
                                required
                            />

                            <label>
                                Nom de l'enfant
                            </label>

                            <input
                                type="text"
                                placeholder="Nom de votre enfant"
                                value={nomEnfant}
                                onChange={(e) =>
                                    setNomEnfant(e.target.value)
                                }
                                required
                            />

                            <label>
                                Date de naissance de l'enfant
                            </label>

                            <input
                                type="date"
                                value={dateNaissanceEnfant}
                                onChange={(e) =>
                                    setDateNaissanceEnfant(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <label>
                                Classe de l'enfant
                            </label>

                            <select
                                value={classeEnfant}
                                onChange={(e) =>
                                    setClasseEnfant(
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Sélectionnez la classe
                                </option>

                                <option value="6e">6e</option>
                                <option value="5e">5e</option>
                                <option value="4e">4e</option>
                                <option value="3e">3e</option>
                                <option value="2nde">2nde</option>
                                <option value="1ère">1ère</option>
                                <option value="Terminale">
                                    Terminale
                                </option>
                            </select>
                        </>
                    )}

                    {/* ==============================
                        INFORMATIONS ÉLÈVE
                    ============================== */}

                    {type === 'eleve' && (
                        <>
                            <label>Classe</label>

                            <select
                                value={classe}
                                onChange={(e) =>
                                    setClasse(e.target.value)
                                }
                                required
                            >
                                <option value="">
                                    Sélectionnez votre classe
                                </option>

                                <option value="6e">6e</option>
                                <option value="5e">5e</option>
                                <option value="4e">4e</option>
                                <option value="3e">3e</option>
                                <option value="2nde">2nde</option>
                                <option value="1ère">1ère</option>
                                <option value="Terminale">
                                    Terminale
                                </option>
                            </select>

                            <label>
                                Date de naissance
                            </label>

                            <input
                                type="date"
                                value={dateNaissance}
                                onChange={(e) =>
                                    setDateNaissance(
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </>
                    )}

                    {/* ==============================
                        EMAIL
                    ============================== */}

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    {/* ==============================
                        MOT DE PASSE
                    ============================== */}

                    <label>Mot de passe</label>

                    <input
                        type="password"
                        placeholder="Créer un mot de passe"
                        value={motDePasse}
                        onChange={(e) =>
                            setMotDePasse(e.target.value)
                        }
                        required
                    />

                    <label>
                        Confirmer le mot de passe
                    </label>

                    <input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        value={confirmation}
                        onChange={(e) =>
                            setConfirmation(e.target.value)
                        }
                        required
                    />

                    {/* ==============================
                        MESSAGE D'ERREUR
                    ============================== */}

                    {erreur && (
                        <p className="erreur-inscription">
                            {erreur}
                        </p>
                    )}

                    {/* ==============================
                        BOUTON
                    ============================== */}

                    <button
                        type="submit"
                        disabled={chargement}
                    >
                        {chargement
                            ? 'Un instant...'
                            : 'Créer mon compte'}
                    </button>
                </form>

                {/* ==============================
                    CONNEXION
                ============================== */}

                <p className="retour-connexion">
                    Vous avez déjà un compte ?

                    <br />

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/connexion?type=${type}`
                            )
                        }
                    >
                        Se connecter
                    </button>
                </p>

            </div>
        </div>
    );
}
