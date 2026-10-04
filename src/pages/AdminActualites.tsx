import { useEffect, useState } from 'react';
import '../Css/AdminActualites.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

type Destination = 'publique' | 'utilisateurs';
type Cible = 'tous' | 'classe' | 'eleve';
type Categorie = 'annonce' | 'sortie' | 'visite';

type Actualite = {
  id: number;
  type: 'annonce' | 'bulletin';
  destination: Destination;
  cible: Cible;
  categorie: Categorie;
  titre: string;
  contenu: string | null;
  classe: string | null;
  eleve_id: number | null;
  periode: string | null;
  photos: string[] | null;
  created_at: string;
};

type Eleve = {
  id: number;
  nom: string;
  prenom: string | null;
  classe: string | null;
};

export default function AdminActualites() {
  const [actualites, setActualites] = useState<Actualite[]>([]);

  const [destination, setDestination] =
    useState<Destination>('publique');

  const [cible, setCible] = useState<Cible>('tous');

  const [categorie, setCategorie] =
    useState<Categorie>('annonce');

  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [classe, setClasse] = useState('');
  const [eleveId, setEleveId] = useState('');
  const [periode, setPeriode] = useState('');

  const [classes, setClasses] = useState<string[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);

  const [photos, setPhotos] = useState<File[]>([]);

  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [publicationEnCours, setPublicationEnCours] =
    useState(false);

  /* =========================================================
     CHARGER LES ACTUALITÉS
     ========================================================= */

  const chargerActualites = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/actualites/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          'Impossible de charger les actualités.'
        );
      }

      const data = await response.json();

      setActualites(data);
    } catch (error) {
      console.error(error);

      setErreur(
        'Impossible de charger les actualités.'
      );
    }
  };

  /* =========================================================
     CHARGER LES CLASSES ET LES ÉLÈVES
     ========================================================= */

  const chargerOptions = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/actualites/options`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          'Impossible de charger les options.'
        );
      }

      const data = await response.json();

      setClasses(data.classes || []);
      setEleves(data.eleves || []);
    } catch (error) {
      console.error(error);

      setErreur(
        'Impossible de charger les classes et les élèves.'
      );
    }
  };

  useEffect(() => {
    chargerActualites();
    chargerOptions();
  }, []);

  /* =========================================================
     CHANGER LA DESTINATION
     ========================================================= */

  const changerDestination = (
    value: Destination
  ) => {
    setDestination(value);

    if (value === 'publique') {
      setCible('tous');
      setClasse('');
      setEleveId('');
    }

    setMessage('');
    setErreur('');
  };

  /* =========================================================
     CHANGER LA CIBLE
     ========================================================= */

  const changerCible = (value: Cible) => {
    setCible(value);

    if (value !== 'classe') {
      setClasse('');
    }

    if (value !== 'eleve') {
      setEleveId('');
    }
  };

  /* =========================================================
     SÉLECTION DES PHOTOS
     ========================================================= */

  const handlePhotos = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    setPhotos(Array.from(event.target.files));
  };

  /* =========================================================
     ENVOYER LES PHOTOS
     ========================================================= */

  const uploaderPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) {
      return [];
    }

    const token = localStorage.getItem('token');

    const formData = new FormData();

    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    const response = await fetch(
      `${API_URL}/api/actualites/photos`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        'Erreur lors de l’envoi des photos.'
      );
    }

    const data = await response.json();

    return data.urls || [];
  };

  /* =========================================================
     PUBLIER UNE ACTUALITÉ
     ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage('');
    setErreur('');

    if (!titre.trim()) {
      setErreur('Le titre est obligatoire.');
      return;
    }

    if (
      destination === 'utilisateurs' &&
      cible === 'classe' &&
      !classe
    ) {
      setErreur(
        'Veuillez sélectionner une classe.'
      );
      return;
    }

    if (
      destination === 'utilisateurs' &&
      cible === 'eleve' &&
      !eleveId
    ) {
      setErreur(
        'Veuillez sélectionner un élève.'
      );
      return;
    }

    try {
      setPublicationEnCours(true);

      let photosUrls: string[] = [];

      if (
        destination === 'publique' &&
        photos.length > 0
      ) {
        photosUrls = await uploaderPhotos();
      }

      const token = localStorage.getItem('token');

      const body = {
        type: 'annonce',

        destination,

        cible:
          destination === 'utilisateurs'
            ? cible
            : 'tous',

        categorie:
          destination === 'publique'
            ? categorie
            : 'annonce',

        titre: titre.trim(),

        contenu:
          contenu.trim() || undefined,

        classe:
          destination === 'utilisateurs' &&
          cible === 'classe'
            ? classe
            : undefined,

        eleveId:
          destination === 'utilisateurs' &&
          cible === 'eleve'
            ? Number(eleveId)
            : undefined,

        periode:
          periode.trim() || undefined,

        photos:
          destination === 'publique' &&
          photosUrls.length > 0
            ? photosUrls
            : undefined,
      };

      const response = await fetch(
        `${API_URL}/api/actualites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Erreur lors de la publication.'
        );
      }

      setMessage(
        'Actualité publiée avec succès.'
      );

      /* Réinitialisation du formulaire */

      setTitre('');
      setContenu('');
      setClasse('');
      setEleveId('');
      setPeriode('');
      setPhotos([]);

      setDestination('publique');
      setCible('tous');
      setCategorie('annonce');

      await chargerActualites();

    } catch (error) {
      console.error(error);

      setErreur(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la publication.'
      );

    } finally {
      setPublicationEnCours(false);
    }
  };

  /* =========================================================
     SUPPRIMER UNE ACTUALITÉ
     ========================================================= */

  const supprimerActualite = async (
    id: number
  ) => {
    const confirmation = window.confirm(
      'Voulez-vous vraiment supprimer cette actualité ?'
    );

    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/actualites/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Impossible de supprimer cette actualité.'
        );
      }

      setMessage(
        'Actualité supprimée avec succès.'
      );

      await chargerActualites();

    } catch (error) {
      console.error(error);

      setErreur(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression.'
      );
    }
  };

  /* =========================================================
     TROUVER LE NOM D'UN ÉLÈVE
     ========================================================= */

  const nomEleve = (
    id: number | null
  ) => {
    if (!id) return '';

    const eleve = eleves.find(
      (item) => item.id === id
    );

    if (!eleve) return '';

    return `${eleve.prenom || ''} ${eleve.nom}`.trim();
  };

  /* =========================================================
     AFFICHAGE
     ========================================================= */

  return (
    <div className="admin-eleves">

      {/* =====================================================
          HEADER ADMIN
          ===================================================== */}

      <AdminHeader
        titre="Gestion des actualités"
        sousTitre="Publiez et gérez les actualités destinées au site ou aux utilisateurs."
      />

      {/* =====================================================
          CONTENU ADMIN
          ===================================================== */}

      <main className="admin-eleves-content">

        {/* ===================================================
            MESSAGES
            =================================================== */}

        {message && (
          <div className="actualite-message-succes">
            {message}
          </div>
        )}

        {erreur && (
          <div className="actualite-message-erreur">
            {erreur}
          </div>
        )}

        {/* ===================================================
            FORMULAIRE DE PUBLICATION
            =================================================== */}

        <section className="actualites-section">

          <h2>Publier une actualité</h2>

          <form
            className="actualites-form"
            onSubmit={handleSubmit}
          >

            {/* DESTINATION */}

            <div>
              <label htmlFor="destination">
                Destination
              </label>

              <select
                id="destination"
                value={destination}
                onChange={(event) =>
                  changerDestination(
                    event.target.value as Destination
                  )
                }
              >
                <option value="publique">
                  🌐 Public
                </option>

                <option value="utilisateurs">
                  🔔 Utilisateurs
                </option>
              </select>
            </div>

            {/* CATÉGORIE */}

            {destination === 'publique' && (
              <div>
                <label htmlFor="categorie">
                  Catégorie
                </label>

                <select
                  id="categorie"
                  value={categorie}
                  onChange={(event) =>
                    setCategorie(
                      event.target.value as Categorie
                    )
                  }
                >
                  <option value="annonce">
                    Annonce
                  </option>

                  <option value="sortie">
                    Sortie
                  </option>

                  <option value="visite">
                    Visite
                  </option>
                </select>
              </div>
            )}

            {/* DESTINATAIRES */}

            {destination === 'utilisateurs' && (
              <div>
                <label htmlFor="cible">
                  Destinataires
                </label>

                <select
                  id="cible"
                  value={cible}
                  onChange={(event) =>
                    changerCible(
                      event.target.value as Cible
                    )
                  }
                >
                  <option value="tous">
                    Tous les utilisateurs
                  </option>

                  <option value="classe">
                    Une classe
                  </option>

                  <option value="eleve">
                    Un élève
                  </option>
                </select>
              </div>
            )}

            {/* CLASSE */}

            {destination === 'utilisateurs' &&
              cible === 'classe' && (
                <div>
                  <label htmlFor="classe">
                    Classe
                  </label>

                  <select
                    id="classe"
                    value={classe}
                    onChange={(event) =>
                      setClasse(event.target.value)
                    }
                  >
                    <option value="">
                      -- Sélectionner une classe --
                    </option>

                    {classes.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* ÉLÈVE */}

            {destination === 'utilisateurs' &&
              cible === 'eleve' && (
                <div>
                  <label htmlFor="eleve">
                    Élève
                  </label>

                  <select
                    id="eleve"
                    value={eleveId}
                    onChange={(event) =>
                      setEleveId(event.target.value)
                    }
                  >
                    <option value="">
                      -- Sélectionner un élève --
                    </option>

                    {eleves.map((eleve) => (
                      <option
                        key={eleve.id}
                        value={eleve.id}
                      >
                        {eleve.prenom || ''}{' '}
                        {eleve.nom}
                        {eleve.classe
                          ? ` — ${eleve.classe}`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* TITRE */}

            <div className="champ-complet">

              <label htmlFor="titre">
                Titre
              </label>

              <input
                id="titre"
                type="text"
                value={titre}
                onChange={(event) =>
                  setTitre(event.target.value)
                }
                placeholder="Exemple : Sortie pédagogique au musée"
              />

            </div>

            {/* CONTENU */}

            <div className="champ-complet">

              <label htmlFor="contenu">
                Contenu
              </label>

              <textarea
                id="contenu"
                value={contenu}
                onChange={(event) =>
                  setContenu(event.target.value)
                }
                placeholder="Écrivez le contenu de votre actualité..."
                rows={6}
              />

            </div>

            {/* PÉRIODE */}

            <div>

              <label htmlFor="periode">
                Période
              </label>

              <input
                id="periode"
                type="text"
                value={periode}
                onChange={(event) =>
                  setPeriode(event.target.value)
                }
                placeholder="Exemple : 10 au 15 octobre 2026"
              />

            </div>

            {/* PHOTOS */}

            {destination === 'publique' && (
              <div>

                <label htmlFor="photos">
                  Photos
                </label>

                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                />

                {photos.length > 0 && (
                  <small className="photos-selection">
                    📷 {photos.length} photo(s)
                    sélectionnée(s)
                  </small>
                )}

              </div>
            )}

            {/* BOUTON */}

            <div className="champ-complet">

              <button
                type="submit"
                className="btn-publier-actualite"
                disabled={publicationEnCours}
              >
                {publicationEnCours
                  ? 'Publication en cours...'
                  : '📢 Publier l’actualité'}
              </button>

            </div>

          </form>

        </section>
        <br /><br /><br />

        {/* ===================================================
            LISTE DES ACTUALITÉS
            =================================================== */}

        <section className="actualites-section">

          <h2>Actualités publiées</h2>

          {actualites.length === 0 ? (

            <div className="aucune-actualite">
              Aucune actualité publiée pour le moment.
            </div>

          ) : (

            <div className="actualites-liste">

              {actualites.map((actualite) => (

                <article
                  key={actualite.id}
                  className="actualite-card"
                >

                  {/* EN-TÊTE DE LA CARTE */}

                  <div className="actualite-card-header">

                    <div className="actualite-meta">

                      <span
                        className={
                          actualite.destination === 'publique'
                            ? 'badge-public'
                            : 'badge-utilisateurs'
                        }
                      >
                        {actualite.destination === 'publique'
                          ? '🌐 Public'
                          : '🔔 Utilisateurs'}
                      </span>

                      <span className="badge-categorie">
                        {actualite.categorie}
                      </span>

                    </div>

                    <span className="actualite-date">
                      {new Date(
                        actualite.created_at
                      ).toLocaleDateString('fr-FR')}
                    </span>

                  </div>

                  {/* TITRE */}

                  <h3>
                    {actualite.titre}
                  </h3>

                  {/* CONTENU */}

                  {actualite.contenu && (
                    <p>
                      {actualite.contenu}
                    </p>
                  )}

                  {/* DÉTAILS */}

                  <div className="actualite-details">

                    {actualite.periode && (
                      <span className="actualite-periode">
                        📅 {actualite.periode}
                      </span>
                    )}

                    {actualite.destination ===
                      'utilisateurs' && (
                      <span>
                        🎯{' '}

                        {actualite.cible ===
                          'tous' &&
                          'Tous les utilisateurs'}

                        {actualite.cible ===
                          'classe' &&
                          `Classe : ${actualite.classe}`}

                        {actualite.cible ===
                          'eleve' &&
                          `Élève : ${nomEleve(
                            actualite.eleve_id
                          )}`}
                      </span>
                    )}

                    {actualite.photos &&
                      actualite.photos.length > 0 && (
                        <span>
                          📷{' '}
                          {actualite.photos.length}
                          {' '}
                          photo(s)
                        </span>
                      )}

                  </div>

                  {/* APERÇU DES PHOTOS */}

                  {actualite.photos &&
                    actualite.photos.length > 0 && (
                      <div className="actualite-photos">

                        {actualite.photos.map(
                          (photo, index) => (
                            <img
                              key={`${actualite.id}-${index}`}
                              src={`${API_URL}${photo}`}
                              alt={`Photo actualité ${index + 1}`}
                            />
                          )
                        )}

                      </div>
                    )}

                  {/* SUPPRIMER */}

                  <button
                    type="button"
                    className="btn-supprimer-actualite"
                    onClick={() =>
                      supprimerActualite(
                        actualite.id
                      )
                    }
                  >
                    🗑 Supprimer
                  </button>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

