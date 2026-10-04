import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Devoirs.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Devoir {
  id: number;
  classe: string;
  matiere: string;
  titre: string;
  description: string | null;
  date_devoir: string;
}

interface User {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  classe?: string | null;
  role?: 'eleve' | 'parent';
}

interface Enfant {
  id: number;
  prenom?: string;
  nom: string;
  email: string;
  classe: string;
  date_naissance: string;
}

export default function Devoirs() {
  const navigate = useNavigate();

  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [enfant, setEnfant] = useState<Enfant | null>(null);

  const [classe, setClasse] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        const userData = localStorage.getItem('user');

        if (!userData) {
          navigate('/connexion');
          return;
        }

        const utilisateur: User = JSON.parse(userData);

        setUser(utilisateur);

        let classeUtilisateur = '';

        // ==========================================
        // CAS 1 : ÉLÈVE
        // ==========================================

        if (utilisateur.role === 'eleve') {
          if (!utilisateur.classe) {
            throw new Error(
              "La classe de l'élève n'est pas renseignée."
            );
          }

          classeUtilisateur = utilisateur.classe;
        }

        // ==========================================
        // CAS 2 : PARENT
        // ==========================================

        if (utilisateur.role === 'parent') {
          const enfantsResponse = await fetch(
            `${API_URL}/api/children`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const enfantsData =
            await enfantsResponse.json();

          if (!enfantsResponse.ok) {
            throw new Error(
              enfantsData.message ||
                'Impossible de récupérer les enfants.'
            );
          }

          const enfants: Enfant[] =
            enfantsData.enfants || [];

          if (enfants.length === 0) {
            throw new Error(
              "Aucun enfant n'est associé à ce compte parent."
            );
          }

          // Pour le moment : premier enfant associé
          const premierEnfant = enfants[0];

          setEnfant(premierEnfant);

          if (!premierEnfant.classe) {
            throw new Error(
              "La classe de votre enfant n'est pas renseignée."
            );
          }

          classeUtilisateur =
            premierEnfant.classe;
        }

        setClasse(classeUtilisateur);

        // ==========================================
        // CHARGER LES DEVOIRS
        // ==========================================

        const response = await fetch(
          `${API_URL}/api/devoirs/mes-devoirs`,
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
              'Impossible de récupérer les devoirs.'
          );
        }

        setDevoirs(data.devoirs || []);

        /*
         * Si le serveur renvoie une classe,
         * on l'utilise.
         * Sinon on conserve celle de l'enfant
         * ou de l'élève.
         */
        if (data.classe) {
          setClasse(data.classe);
        }

      } catch (error) {
        console.error(
          'Erreur devoirs :',
          error
        );

        setErreur(
          error instanceof Error
            ? error.message
            : 'Impossible de contacter le serveur.'
        );
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, [navigate]);

  // ==========================================
  // NOM ET PRÉNOM À AFFICHER
  // ==========================================

  const nom =
    user?.role === 'parent'
      ? enfant?.nom || '-'
      : user?.nom || '-';

  const prenom =
    user?.role === 'parent'
      ? enfant?.prenom || '-'
      : user?.prenom || '-';

  const classeAffichee =
    classe || '-';

  // ==========================================
  // AFFICHAGE
  // ==========================================

  return (
    <div className="devoirs-page">

      {/* ======================================
          EN-TÊTE
      ====================================== */}

      <header className="devoirs-header">

        <div>

          <h1>
            📚 Mes devoirs
          </h1>

          <p>
            Retrouvez les devoirs qui vous concernent.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate('/tableau-de-bord')
          }
        >
          ← Retour
        </button>

      </header>

      <main className="devoirs-content">

        {/* ======================================
            CHARGEMENT
        ====================================== */}

        {chargement && (
          <div className="devoirs-loading">
            <p>
              Chargement des devoirs...
            </p>
          </div>
        )}

        {/* ======================================
            ERREUR
        ====================================== */}

        {erreur && (
          <div className="devoirs-erreur">
            ⚠️ {erreur}
          </div>
        )}

        {/* ======================================
            CONTENU
        ====================================== */}

        {!chargement && !erreur && (
          <>

            {/* ==================================
                INFORMATIONS ÉLÈVE
            ================================== */}

            <section className="eleve-info">

              <div>
                <span>
                  Nom
                </span>

                <strong>
                  {nom}
                </strong>
              </div>

              <div>
                <span>
                  Prénom
                </span>

                <strong>
                  {prenom}
                </strong>
              </div>

              <div>
                <span>
                  Classe
                </span>

                <strong>
                  {classeAffichee}
                </strong>
              </div>

            </section>

            {/* ==================================
                LISTE DES DEVOIRS
            ================================== */}

            <section className="devoirs-card">

              <div className="devoirs-card-header">

                <div>

                  <h2>
                    📚 Mes devoirs
                  </h2>

                  <p>
                    Les devoirs donnés pour votre classe.
                  </p>

                </div>

                <span className="devoirs-count">
                  {devoirs.length}
                </span>

              </div>

              {devoirs.length === 0 ? (

                <div className="aucun-devoir">

                  <span>
                    📚
                  </span>

                  <h3>
                    Aucun devoir
                  </h3>

                  <p>
                    Aucun devoir n'est disponible
                    pour le moment.
                  </p>

                </div>

              ) : (

                <div className="devoirs-list">

                  {devoirs.map((devoir) => (

                    <article
                      className="devoir-item"
                      key={devoir.id}
                    >

                      <div className="devoir-icon">
                        📖
                      </div>

                      <div className="devoir-info">

                        <div className="devoir-top">

                          <span className="devoir-matiere">
                            {devoir.matiere}
                          </span>

                          <span className="devoir-date">
                            📅{' '}
                            {new Date(
                              devoir.date_devoir
                            ).toLocaleDateString(
                              'fr-FR'
                            )}
                          </span>

                        </div>

                        <h3>
                          {devoir.titre}
                        </h3>

                        {devoir.description && (
                          <div className="devoir-description">

                            <strong>
                              📝 Consigne
                            </strong>

                            <p>
                              {devoir.description}
                            </p>

                          </div>
                        )}

                      </div>

                    </article>

                  ))}

                </div>

              )}

            </section>

          </>
        )}

      </main>

    </div>
  );
}
