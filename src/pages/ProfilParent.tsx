import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/ProfilParent.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Parent {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe?: string | null;
  date_naissance?: string | null;
}

interface Enfant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe: string;
  date_naissance: string;
}

export default function ProfilParent() {
  const navigate = useNavigate();

  const [parent, setParent] = useState<Parent | null>(null);

  const [enfants, setEnfants] = useState<Enfant[]>([]);

  const [enfantSelectionne, setEnfantSelectionne] =
    useState<Enfant | null>(null);

  const [chargement, setChargement] = useState(true);

  const [erreur, setErreur] = useState('');

  // =========================================================
  // MODIFICATION DU PROFIL
  // =========================================================

  const [modifierProfil, setModifierProfil] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');

  const [messageProfil, setMessageProfil] = useState('');
  const [erreurProfil, setErreurProfil] = useState('');
  const [chargementProfil, setChargementProfil] =
    useState(false);

  // =========================================================
  // MOT DE PASSE
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
  // CHARGER LE PROFIL DU PARENT
  // =========================================================

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        // ===================================================
        // RÉCUPÉRER LE PARENT
        // ===================================================

        const profilResponse = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profilData = await profilResponse.json();

        if (!profilResponse.ok) {
          throw new Error(
            profilData.message ||
              'Impossible de charger le profil.'
          );
        }

        setParent(profilData.user);

        setPrenom(profilData.user.prenom || '');
        setNom(profilData.user.nom || '');
        setEmail(profilData.user.email || '');

        // ===================================================
        // RÉCUPÉRER LES ENFANTS
        // ===================================================

        const enfantsResponse = await fetch(
          `${API_URL}/api/children`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const enfantsData = await enfantsResponse.json();

        if (!enfantsResponse.ok) {
          throw new Error(
            enfantsData.message ||
              'Impossible de récupérer les enfants.'
          );
        }

        const listeEnfants =
          enfantsData.enfants || [];

        setEnfants(listeEnfants);

        if (listeEnfants.length > 0) {
          setEnfantSelectionne(listeEnfants[0]);
        }

      } catch (error) {
        console.error(error);

        setErreur(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les informations.'
        );

      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
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
            date_naissance: null,
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

      setParent(data.user);

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
      <div className="profil-parent-page">
        <div className="profil-parent-chargement">
          Chargement de votre profil...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERREUR
  // =========================================================

  if (erreur || !parent) {
    return (
      <div className="profil-parent-page">
        <div className="profil-parent-erreur">
          {erreur || 'Profil introuvable.'}
        </div>
      </div>
    );
  }

  // =========================================================
  // AFFICHAGE
  // =========================================================

  return (
    <div className="profil-parent-page">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <header className="profil-parent-header">

        

        <h1>Mon profil parent</h1>

        <button
          className="profil-parent-retour"
          onClick={() =>
            navigate('/tableau-de-bord')
          }
        >
          ← Retour
        </button>

      </header>


      <main className="profil-parent-container">

        {/* ===================================================
            IDENTITÉ DU PARENT
        =================================================== */}

        <section className="profil-parent-card profil-parent-identite">

          <div className="profil-parent-avatar">

            {parent.prenom
              ?.charAt(0)
              .toUpperCase()}

            {parent.nom
              ?.charAt(0)
              .toUpperCase()}

          </div>


          <div>

            <h2>
              {parent.prenom} {parent.nom}
            </h2>

            <p>
              👨‍👩‍👧 Parent
            </p>

          </div>

        </section>


        {/* ===================================================
            MESSAGE PROFIL
        =================================================== */}

        {messageProfil && (
          <div className="profil-parent-message-succes">
            ✅ {messageProfil}
          </div>
        )}

        {erreurProfil && (
          <div className="profil-parent-message-erreur">
            ⚠️ {erreurProfil}
          </div>
        )}


        {/* ===================================================
            INFORMATIONS DU PARENT
        =================================================== */}

        <section className="profil-parent-card">

          <div className="profil-parent-section-title">

            <span>👤</span>

            <div>

              <h2>
                Mes informations
              </h2>

              <p>
                Informations personnelles du parent
              </p>

            </div>

          </div>


          {!modifierProfil ? (

            <div className="profil-parent-informations">

              <div className="profil-parent-information">

                <span>
                  Prénom
                </span>

                <strong>
                  {parent.prenom}
                </strong>

              </div>


              <div className="profil-parent-information">

                <span>
                  Nom
                </span>

                <strong>
                  {parent.nom}
                </strong>

              </div>


              <div className="profil-parent-information profil-parent-information-complet">

                <span>
                  Adresse e-mail
                </span>

                <strong>
                  {parent.email}
                </strong>

              </div>

            </div>

          ) : (

            <form
              className="profil-parent-form"
              onSubmit={enregistrerProfil}
            >

              <div className="profil-parent-form-group">

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


              <div className="profil-parent-form-group">

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


              <div className="profil-parent-form-group profil-parent-form-full">

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


              <div className="profil-parent-form-actions">

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
            ENFANTS
        =================================================== */}

        <section className="profil-parent-card">

          <div className="profil-parent-section-title">

            <span>👨‍👩‍👧</span>

            <div>

              <h2>
                Mes enfants
              </h2>

              <p>
                Les élèves associés à votre compte
              </p>

            </div>

          </div>


          {enfants.length === 0 ? (

            <div className="profil-parent-aucun-enfant">
              Aucun enfant n'est associé à ce compte.
            </div>

          ) : (

            <div className="profil-parent-enfants">

              {enfants.map((enfant) => (

                <button
                  key={enfant.id}
                  className={
                    enfantSelectionne?.id === enfant.id
                      ? 'profil-parent-enfant actif'
                      : 'profil-parent-enfant'
                  }
                  onClick={() =>
                    setEnfantSelectionne(enfant)
                  }
                >

                  <div className="profil-parent-enfant-avatar">
                    {enfant.prenom
                      ?.charAt(0)
                      .toUpperCase()}
                    {enfant.nom
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <strong>
                      {enfant.prenom} {enfant.nom}
                    </strong>

                    <span>
                      🎓 {enfant.classe}
                    </span>

                  </div>

                </button>

              ))}

            </div>

          )}

        </section>


        {/* ===================================================
            INFORMATIONS ENFANT
        =================================================== */}

        {enfantSelectionne && (

          <section className="profil-parent-card">

            <div className="profil-parent-section-title">

              <span>🎓</span>

              <div>

                <h2>
                  Informations de l'élève
                </h2>

                <p>
                  Informations scolaires de votre enfant
                </p>

              </div>

            </div>


            <div className="profil-parent-informations">

              <div className="profil-parent-information">

                <span>
                  Prénom
                </span>

                <strong>
                  {enfantSelectionne.prenom}
                </strong>

              </div>


              <div className="profil-parent-information">

                <span>
                  Nom
                </span>

                <strong>
                  {enfantSelectionne.nom}
                </strong>

              </div>


              <div className="profil-parent-information">

                <span>
                  Classe
                </span>

                <strong>
                  {enfantSelectionne.classe}
                </strong>

              </div>


              <div className="profil-parent-information">

                <span>
                  Date de naissance
                </span>

                <strong>
                  {formaterDate(
                    enfantSelectionne.date_naissance
                  )}
                </strong>

              </div>

            </div>


            <div className="profil-parent-actions">

              <button
                onClick={() =>
                  navigate(
                    `/resultats?eleve=${enfantSelectionne.id}`
                  )
                }
              >
                📊 Résultats
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/devoirs?eleve=${enfantSelectionne.id}`
                  )
                }
              >
                📚 Devoirs
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/absences?eleve=${enfantSelectionne.id}`
                  )
                }
              >
                🕐 Absences
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/emploi-du-temps?classe=${encodeURIComponent(
                      enfantSelectionne.classe
                    )}`
                  )
                }
              >
                📅 Emploi du temps
              </button>

            </div>

          </section>

        )}


        {/* ===================================================
            MOT DE PASSE
        =================================================== */}

        <section className="profil-parent-card">

          <div className="profil-parent-section-title">

            <span>🔐</span>

            <div>

              <h2>
                Sécurité du compte
              </h2>

              <p>
                Gérer votre mot de passe
              </p>

            </div>

          </div>


          {!modifierMotDePasse ? (

            <div className="profil-parent-actions">

              <button
                onClick={() => {
                  setErreurMotDePasse('');
                  setMessageMotDePasse('');
                  setModifierMotDePasse(true);
                }}
              >
                🔒 Modifier le mot de passe
              </button>

            </div>

          ) : (

            <form
              className="profil-parent-form"
              onSubmit={changerMotDePasse}
            >

              <div className="profil-parent-form-group profil-parent-form-full">

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


              <div className="profil-parent-form-group">

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


              <div className="profil-parent-form-group">

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


              <div className="profil-parent-form-actions">

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
            <div className="profil-parent-message-succes">
              ✅ {messageMotDePasse}
            </div>
          )}

          {erreurMotDePasse && (
            <div className="profil-parent-message-erreur">
              ⚠️ {erreurMotDePasse}
            </div>
          )}

        </section>

      </main>

    </div>
  );
}

