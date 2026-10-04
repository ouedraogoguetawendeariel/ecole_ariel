import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/ProfilEleve.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Eleve {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe: string | null;
  date_naissance: string | null;
}

export default function ProfilEleve() {
  const navigate = useNavigate();

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // =========================================================
  // FORMULAIRE PROFIL
  // =========================================================

  const [modifierProfil, setModifierProfil] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');

  const [messageProfil, setMessageProfil] = useState('');
  const [erreurProfil, setErreurProfil] = useState('');
  const [chargementProfil, setChargementProfil] = useState(false);

  // =========================================================
  // FORMULAIRE MOT DE PASSE
  // =========================================================

  const [modifierMotDePasse, setModifierMotDePasse] =
    useState(false);

  const [ancienMotDePasse, setAncienMotDePasse] =
    useState('');

  const [nouveauMotDePasse, setNouveauMotDePasse] =
    useState('');

  const [confirmationMotDePasse, setConfirmationMotDePasse] =
    useState('');

  const [messageMotDePasse, setMessageMotDePasse] =
    useState('');

  const [erreurMotDePasse, setErreurMotDePasse] =
    useState('');

  const [chargementMotDePasse, setChargementMotDePasse] =
    useState(false);

  // =========================================================
  // CHARGER LE PROFIL
  // =========================================================

  useEffect(() => {
    const chargerProfil = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Impossible de charger le profil.'
          );
        }

        setEleve(data.user);

        // Préremplir le formulaire
        setPrenom(data.user.prenom || '');
        setNom(data.user.nom || '');
        setEmail(data.user.email || '');

        if (data.user.date_naissance) {
          setDateNaissance(
            data.user.date_naissance.substring(0, 10)
          );
        }

      } catch (error) {
        console.error(error);

        setErreur(
          'Impossible de charger votre profil.'
        );
      } finally {
        setChargement(false);
      }
    };

    chargerProfil();
  }, [navigate]);

  // =========================================================
  // FORMATER DATE
  // =========================================================

  const formaterDate = (date: string | null) => {
    if (!date) {
      return 'Non renseignée';
    }

    return new Date(date).toLocaleDateString('fr-FR');
  };

  // =========================================================
  // MODIFIER LE PROFIL
  // =========================================================

  const enregistrerProfil = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessageProfil('');
    setErreurProfil('');

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/connexion');
      return;
    }

    if (!prenom.trim() || !nom.trim() || !email.trim()) {
      setErreurProfil(
        'Le prénom, le nom et l\'email sont obligatoires.'
      );
      return;
    }

    try {
      setChargementProfil(true);

      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            prenom: prenom.trim(),
            nom: nom.trim(),
            email: email.trim(),
            date_naissance:
              dateNaissance || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Impossible de modifier le profil.'
        );
      }

      // Mettre à jour l'affichage
      setEleve(data.user);

      // Mettre également localStorage à jour
      const utilisateurLocal =
        localStorage.getItem('user');

      if (utilisateurLocal) {
        const utilisateur =
          JSON.parse(utilisateurLocal);

        localStorage.setItem(
          'user',
          JSON.stringify({
            ...utilisateur,
            ...data.user,
          })
        );
      }

      setMessageProfil(
        'Profil modifié avec succès.'
      );

      setModifierProfil(false);

    } catch (error) {
      console.error(error);

      setErreurProfil(
        error instanceof Error
          ? error.message
          : 'Impossible de modifier le profil.'
      );

    } finally {
      setChargementProfil(false);
    }
  };

  // =========================================================
  // MODIFIER MOT DE PASSE
  // =========================================================

  const changerMotDePasse = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessageMotDePasse('');
    setErreurMotDePasse('');

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/connexion');
      return;
    }

    if (
      !ancienMotDePasse ||
      !nouveauMotDePasse ||
      !confirmationMotDePasse
    ) {
      setErreurMotDePasse(
        'Veuillez remplir tous les champs.'
      );
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setErreurMotDePasse(
        'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      );
      return;
    }

    if (
      nouveauMotDePasse !==
      confirmationMotDePasse
    ) {
      setErreurMotDePasse(
        'Les deux nouveaux mots de passe ne correspondent pas.'
      );
      return;
    }

    try {
      setChargementMotDePasse(true);

      const response = await fetch(
        `${API_URL}/api/auth/me/password`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ancienMotDePasse,
            nouveauMotDePasse,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Impossible de modifier le mot de passe.'
        );
      }

      setMessageMotDePasse(
        'Mot de passe modifié avec succès.'
      );

      // Vider les champs
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');

      setModifierMotDePasse(false);

    } catch (error) {
      console.error(error);

      setErreurMotDePasse(
        error instanceof Error
          ? error.message
          : 'Impossible de modifier le mot de passe.'
      );

    } finally {
      setChargementMotDePasse(false);
    }
  };

  // =========================================================
  // CHARGEMENT
  // =========================================================

  if (chargement) {
    return (
      <div className="profil-page">
        <div className="profil-chargement">
          Chargement de votre profil...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERREUR
  // =========================================================

  if (erreur || !eleve) {
    return (
      <div className="profil-page">
        <div className="profil-erreur">
          {erreur || 'Profil introuvable.'}
        </div>
      </div>
    );
  }

  // =========================================================
  // AFFICHAGE
  // =========================================================

  return (
    <div className="profil-page">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <header className="profil-header">

        <h1>Mon profil</h1>

        <button
          className="profil-retour"
          onClick={() =>
            navigate('/tableau-de-bord')
          }
        >
          ← Retour
        </button>

      </header>


      {/* =====================================================
          CONTENU
      ===================================================== */}

      <main className="profil-container">


        {/* ===================================================
            IDENTITÉ
        =================================================== */}

        <section className="profil-card profil-identite">

          <div className="profil-avatar">

            {eleve.prenom
              ?.charAt(0)
              .toUpperCase()}

            {eleve.nom
              ?.charAt(0)
              .toUpperCase()}

          </div>


          <div className="profil-identite-info">

            <h2>
              {eleve.prenom} {eleve.nom}
            </h2>

            <p className="profil-role">
              🎓 Élève
            </p>

            <p className="profil-classe">
              {eleve.classe ||
                'Classe non renseignée'}
            </p>

          </div>

        </section>


        {/* ===================================================
            MESSAGE MODIFICATION PROFIL
        =================================================== */}

        {messageProfil && (
          <div className="profil-message-succes">
            ✅ {messageProfil}
          </div>
        )}

        {erreurProfil && (
          <div className="profil-message-erreur">
            ⚠️ {erreurProfil}
          </div>
        )}


        {/* ===================================================
            INFORMATIONS PERSONNELLES
        =================================================== */}

        <section className="profil-card">

          <div className="profil-section-title">

            <span>👤</span>

            <div>

              <h2>
                Informations personnelles
              </h2>

              <p>
                Vos informations scolaires et
                personnelles
              </p>

            </div>

          </div>


          {!modifierProfil ? (

            <div className="profil-informations">

              <div className="profil-information">

                <span className="profil-label">
                  Prénom
                </span>

                <strong>
                  {eleve.prenom ||
                    'Non renseigné'}
                </strong>

              </div>


              <div className="profil-information">

                <span className="profil-label">
                  Nom
                </span>

                <strong>
                  {eleve.nom ||
                    'Non renseigné'}
                </strong>

              </div>


              <div className="profil-information">

                <span className="profil-label">
                  Classe
                </span>

                <strong>
                  {eleve.classe ||
                    'Non renseignée'}
                </strong>

              </div>


              <div className="profil-information">

                <span className="profil-label">
                  Date de naissance
                </span>

                <strong>
                  {formaterDate(
                    eleve.date_naissance
                  )}
                </strong>

              </div>

            </div>

          ) : (

            <form
              className="profil-form"
              onSubmit={enregistrerProfil}
            >

              <div className="profil-form-group">

                <label>
                  Prénom
                </label>

                <input
                  type="text"
                  value={prenom}
                  onChange={(e) =>
                    setPrenom(e.target.value)
                  }
                />

              </div>


              <div className="profil-form-group">

                <label>
                  Nom
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(e) =>
                    setNom(e.target.value)
                  }
                />

              </div>


              <div className="profil-form-group">

                <label>
                  Adresse e-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>


              <div className="profil-form-group">

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
                />

              </div>


              <div className="profil-form-actions">

                <button
                  type="submit"
                  disabled={chargementProfil}
                >
                  {chargementProfil
                    ? 'Enregistrement...'
                    : '💾 Enregistrer'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModifierProfil(false)
                  }
                >
                  Annuler
                </button>

              </div>

            </form>

          )}

        </section>


        {/* ===================================================
            COMPTE
        =================================================== */}

        <section className="profil-card">

          <div className="profil-section-title">

            <span>🔐</span>

            <div>

              <h2>
                Mon compte
              </h2>

              <p>
                Informations liées à votre compte
              </p>

            </div>

          </div>


          {!modifierMotDePasse ? (

            <>

              <div className="profil-informations">

                <div className="profil-information profil-information-complet">

                  <span className="profil-label">
                    Adresse e-mail
                  </span>

                  <strong>
                    {eleve.email}
                  </strong>

                </div>

              </div>


              <div className="profil-actions">

                <button
                  type="button"
                  onClick={() => {
                    setErreurProfil('');
                    setMessageProfil('');
                    setModifierProfil(true);
                  }}
                >
                  ✏️ Modifier mon profil
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setErreurMotDePasse('');
                    setMessageMotDePasse('');
                    setModifierMotDePasse(true);
                  }}
                >
                  🔒 Modifier le mot de passe
                </button>

              </div>

            </>

          ) : (

            <form
              className="profil-form"
              onSubmit={changerMotDePasse}
            >

              <div className="profil-form-group">

                <label>
                  Ancien mot de passe
                </label>

                <input
                  type="password"
                  value={ancienMotDePasse}
                  onChange={(e) =>
                    setAncienMotDePasse(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="profil-form-group">

                <label>
                  Nouveau mot de passe
                </label>

                <input
                  type="password"
                  value={nouveauMotDePasse}
                  onChange={(e) =>
                    setNouveauMotDePasse(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="profil-form-group">

                <label>
                  Confirmer le nouveau mot de passe
                </label>

                <input
                  type="password"
                  value={confirmationMotDePasse}
                  onChange={(e) =>
                    setConfirmationMotDePasse(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="profil-form-actions">

                <button
                  type="submit"
                  disabled={chargementMotDePasse}
                >
                  {chargementMotDePasse
                    ? 'Modification...'
                    : '🔒 Modifier le mot de passe'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModifierMotDePasse(false)
                  }
                >
                  Annuler
                </button>

              </div>

            </form>

          )}


          {messageMotDePasse && (
            <div className="profil-message-succes">
              ✅ {messageMotDePasse}
            </div>
          )}

          {erreurMotDePasse && (
            <div className="profil-message-erreur">
              ⚠️ {erreurMotDePasse}
            </div>
          )}

        </section>

      </main>

    </div>
  );
}
