import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/ActualitesUtilisateur.css';

const API_URL = import.meta.env.VITE_API_URL;

type Actualite = {
  id: number;
  type: string;
  categorie: string;
  destination?: string;
  cible?: string;
  titre: string;
  contenu: string | null;
  classe: string | null;
  eleve_id: number | null;
  periode: string | null;
  fichier_url: string | null;
  photos: string[] | null;
  created_at: string;
};

export default function ActualitesUtilisateur() {
  const navigate = useNavigate();

  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/connexion');
      return;
    }

    const chargerActualites = async () => {
      try {
        setLoading(true);
        setErreur('');

        const response = await fetch(
          `${API_URL}/api/actualites/mes`,
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
              'Erreur lors du chargement des actualités.'
          );
        }

        /*
         * Le backend renvoie directement un tableau :
         *
         * res.json(result.rows)
         *
         * Mais on accepte aussi { actualites: [...] }
         * au cas où le format du backend serait modifié.
         */
        if (Array.isArray(data)) {
          setActualites(data);
        } else if (Array.isArray(data.actualites)) {
          setActualites(data.actualites);
        } else {
          setActualites([]);
        }
      } catch (error) {
        console.error(
          'Erreur chargement actualités utilisateur :',
          error
        );

        setErreur(
          error instanceof Error
            ? error.message
            : 'Erreur lors du chargement des actualités.'
        );
      } finally {
        setLoading(false);
      }
    };

    chargerActualites();
  }, [navigate]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCategorie = (categorie: string) => {
    if (categorie === 'sortie') {
      return '🎒 SORTIE';
    }

    if (categorie === 'visite') {
      return '🏢 VISITE';
    }

    return '📢 INFORMATION';
  };

  return (
    <div className="actualites-user-page">

      {/* ==========================================
          EN-TÊTE
      ========================================== */}

      <header className="actualites-user-header">

        <div>
          <span>ESPACE PERSONNEL</span>

          <h1>
            Mes actualités
          </h1>

          <p>
            Retrouvez ici les informations qui vous
            concernent.
          </p>
        </div>

        {/* BOUTON RETOUR */}

        <button
          type="button"
          onClick={() =>
            navigate('/tableau-de-bord')
          }
        >
          ← Retour
        </button>

      </header>

      {/* ==========================================
          CONTENU
      ========================================== */}

      <section className="actualites-user-section">

        <div className="actualites-user-title">

          <h2>
            🔔 Informations récentes
          </h2>

          <p>
            Les annonces générales, les informations de
            votre classe et les informations personnelles.
          </p>

        </div>

        {/* ==========================================
            CHARGEMENT
        ========================================== */}

        {loading && (
          <div className="actualites-user-loading">
            Chargement de vos actualités...
          </div>
        )}

        {/* ==========================================
            ERREUR
        ========================================== */}

        {erreur && !loading && (
          <div className="actualites-user-error">
            ⚠️ {erreur}
          </div>
        )}

        {/* ==========================================
            AUCUNE ACTUALITÉ
        ========================================== */}

        {!loading &&
          !erreur &&
          actualites.length === 0 && (

            <div className="actualites-user-empty">

              <div>
                📭
              </div>

              <h3>
                Aucune actualité
              </h3>

              <p>
                Vous n'avez actuellement aucune nouvelle
                information.
              </p>

            </div>
          )}

        {/* ==========================================
            LISTE DES ACTUALITÉS
        ========================================== */}

        {!loading &&
          !erreur &&
          actualites.length > 0 && (

            <div className="actualites-user-list">

              {actualites.map((actualite) => (

                <article
                  key={actualite.id}
                  className="actualite-user-card"
                >

                  {/* ==================================
                      HAUT DE LA CARTE
                  ================================== */}

                  <div className="actualite-user-top">

                    <span
                      className={`actualite-user-tag ${actualite.type}`}
                    >
                      {actualite.type === 'bulletin'
                        ? '📄 BULLETIN'
                        : actualite.cible === 'eleve'
                          ? '👤 INFORMATION PERSONNELLE'
                          : actualite.cible === 'classe'
                            ? `🏫 ${actualite.classe || 'VOTRE CLASSE'}`
                            : formatCategorie(
                                actualite.categorie
                              )}
                    </span>

                    <span className="actualite-user-date">
                      {formatDate(
                        actualite.created_at
                      )}
                    </span>

                  </div>

                  {/* ==================================
                      TITRE
                  ================================== */}

                  <h3>
                    {actualite.titre}
                  </h3>

                  {/* ==================================
                      CONTENU
                  ================================== */}

                  {actualite.contenu && (
                    <p>
                      {actualite.contenu}
                    </p>
                  )}

                  {/* ==================================
                      CLASSE
                  ================================== */}

                  {actualite.classe && (
                    <div className="actualite-user-info">

                      🏫 Classe :{' '}

                      <strong>
                        {actualite.classe}
                      </strong>

                    </div>
                  )}

                  {/* ==================================
                      PÉRIODE
                  ================================== */}

                  {actualite.periode && (
                    <div className="actualite-user-info">

                      📅 Période :{' '}

                      <strong>
                        {actualite.periode}
                      </strong>

                    </div>
                  )}

                  {/* ==================================
                      DESTINATAIRE
                  ================================== */}

                  {actualite.cible === 'tous' && (
                    <div className="actualite-user-info">

                      🔔{' '}

                      <strong>
                        Information destinée à tous les
                        utilisateurs
                      </strong>

                    </div>
                  )}

                  {actualite.cible === 'classe' && (
                    <div className="actualite-user-info">

                      👥{' '}

                      <strong>
                        Information destinée à votre classe
                      </strong>

                    </div>
                  )}

                  {actualite.cible === 'eleve' && (
                    <div className="actualite-user-info">

                      👤{' '}

                      <strong>
                        Information personnelle
                      </strong>

                    </div>
                  )}

                  {/* ==================================
                      PHOTOS
                  ================================== */}

                  {actualite.photos &&
                    actualite.photos.length > 0 && (

                      <div className="actualite-user-photos">

                        {actualite.photos.map(
                          (photo, index) => (

                            <img
                              key={`${actualite.id}-${index}`}
                              src={`${API_URL}${photo}`}
                              alt={`${actualite.titre} - photo ${
                                index + 1
                              }`}
                            />

                          )
                        )}

                      </div>
                    )}

                  {/* ==================================
                      DOCUMENT
                  ================================== */}

                  {actualite.fichier_url && (

                    <a
                      href={`${API_URL}${actualite.fichier_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="actualite-user-button"
                    >
                      📄 Voir le document
                    </a>

                  )}

                </article>

              ))}

            </div>
          )}

      </section>

    </div>
  );
}

