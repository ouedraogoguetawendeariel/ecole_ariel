import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Resultats.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Note {
  id: number;
  eleve_id: number;
  prenom?: string;
  nom?: string;
  classe?: string;
  matiere: string;
  note: number;
  coefficient: number;
  trimestre: string;
}

interface Bulletin {
  id: number;
  titre: string;
  periode: string;
  fichier_url: string;
  created_at: string;
  eleve_id?: number;
  nom?: string;
  prenom?: string;
  classe?: string;
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

export default function Resultats() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);

  const [chargement, setChargement] =
    useState(true);

  const [erreur, setErreur] =
    useState('');

  const [trimestre, setTrimestre] =
    useState('Trimestre 1');

  const [user, setUser] =
    useState<User | null>(null);

  const [enfant, setEnfant] =
    useState<Enfant | null>(null);

  // ==========================================
  // CHARGEMENT DES DONNÉES
  // ==========================================

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const token =
          localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        const userData =
          localStorage.getItem('user');

        if (!userData) {
          navigate('/connexion');
          return;
        }

        const utilisateur: User =
          JSON.parse(userData);

        setUser(utilisateur);

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // ======================================
        // SI PARENT : RÉCUPÉRER SON ENFANT
        // ======================================

        if (utilisateur.role === 'parent') {
          const enfantsRes = await fetch(
            `${API_URL}/api/children`,
            {
              headers,
            }
          );

          const enfantsData =
            await enfantsRes.json();

          if (!enfantsRes.ok) {
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

          /*
           * Pour le moment, nous prenons
           * le premier enfant associé.
           */
          setEnfant(enfants[0]);
        }

        // ======================================
        // NOTES
        // ======================================

        const notesRes = await fetch(
          `${API_URL}/api/notes`,
          {
            headers,
          }
        );

        const notesData =
          await notesRes.json();

        if (!notesRes.ok) {
          throw new Error(
            notesData.message ||
              'Impossible de récupérer les notes.'
          );
        }

        setNotes(
          notesData.notes || []
        );

        // ======================================
        // BULLETINS
        // ======================================

        const bulletinsRes = await fetch(
          `${API_URL}/api/bulletins`,
          {
            headers,
          }
        );

        const bulletinsData =
          await bulletinsRes.json();

        if (!bulletinsRes.ok) {
          throw new Error(
            bulletinsData.message ||
              'Impossible de récupérer les bulletins.'
          );
        }

        setBulletins(
          bulletinsData.bulletins || []
        );

      } catch (error) {
        console.error(
          'Erreur résultats :',
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
  // NOTES DU TRIMESTRE
  // ==========================================

  const notesTrimestre =
    notes.filter(
      (item) =>
        item.trimestre === trimestre
    );

  // ==========================================
  // INFORMATIONS DE L'ÉLÈVE
  // ==========================================

  let nom = '-';
  let prenom = '-';
  let classe = '-';

  if (user?.role === 'eleve') {
    nom = user.nom || '-';
    prenom = user.prenom || '-';
    classe = user.classe || '-';
  }

  if (user?.role === 'parent') {
    nom = enfant?.nom || '-';
    prenom = enfant?.prenom || '-';
    classe = enfant?.classe || '-';
  }

  /*
   * Si le serveur fournit également
   * les informations dans les notes/bulletins,
   * on peut les utiliser comme secours.
   */
  if (nom === '-' && notesTrimestre[0]?.nom) {
    nom = notesTrimestre[0].nom;
  }

  if (
    prenom === '-' &&
    notesTrimestre[0]?.prenom
  ) {
    prenom =
      notesTrimestre[0].prenom;
  }

  if (
    classe === '-' &&
    notesTrimestre[0]?.classe
  ) {
    classe =
      notesTrimestre[0].classe;
  }

  if (
    nom === '-' &&
    bulletins[0]?.nom
  ) {
    nom = bulletins[0].nom;
  }

  if (
    prenom === '-' &&
    bulletins[0]?.prenom
  ) {
    prenom =
      bulletins[0].prenom;
  }

  if (
    classe === '-' &&
    bulletins[0]?.classe
  ) {
    classe =
      bulletins[0].classe;
  }

  // ==========================================
  // MOYENNE
  // ==========================================

  const totalPoints =
    notesTrimestre.reduce(
      (total, item) =>
        total +
        Number(item.note) *
          Number(item.coefficient),
      0
    );

  const totalCoefficients =
    notesTrimestre.reduce(
      (total, item) =>
        total +
        Number(item.coefficient),
      0
    );

  const moyenne =
    totalCoefficients > 0
      ? totalPoints /
        totalCoefficients
      : 0;

  // ==========================================
  // OUVRIR LE PDF
  // ==========================================

  const ouvrirBulletin =
    async (id: number) => {
      try {
        const token =
          localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        const nouvelleFenetre =
          window.open(
            '',
            '_blank'
          );

        if (!nouvelleFenetre) {
          alert(
            'Autorisez les fenêtres pop-up pour ouvrir le bulletin.'
          );
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/bulletins/${id}/fichier`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          nouvelleFenetre.close();

          const data =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            data?.message ||
              'Impossible d’ouvrir le bulletin.'
          );
        }

        const blob =
          await response.blob();

        const fichierUrl =
          URL.createObjectURL(blob);

        nouvelleFenetre.location.href =
          fichierUrl;

        setTimeout(() => {
          URL.revokeObjectURL(
            fichierUrl
          );
        }, 60000);

      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : 'Impossible d’ouvrir le bulletin.'
        );
      }
    };

  // ==========================================
  // TÉLÉCHARGER LE PDF
  // ==========================================

  const telechargerBulletin =
    async (
      id: number,
      titre: string
    ) => {
      try {
        const token =
          localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/bulletins/${id}/fichier`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          const data =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            data?.message ||
              'Impossible de télécharger le bulletin.'
          );
        }

        const blob =
          await response.blob();

        const fichierUrl =
          URL.createObjectURL(blob);

        const lien =
          document.createElement('a');

        lien.href =
          fichierUrl;

        lien.download =
          `${titre}.pdf`;

        document.body.appendChild(
          lien
        );

        lien.click();

        lien.remove();

        URL.revokeObjectURL(
          fichierUrl
        );

      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : 'Impossible de télécharger le bulletin.'
        );
      }
    };

  // ==========================================
  // AFFICHAGE
  // ==========================================

  return (
    <div className="resultats-page">

      <header className="resultats-header">

        <div>

          <h1>
            Mes résultats
          </h1>

          <p>
            Consultez vos résultats scolaires.
          </p>

        </div>

        <button
          onClick={() =>
            navigate('/tableau-de-bord')
          }
        >
          ← Retour
        </button>

      </header>

      <main className="resultats-content">

        {/* CHARGEMENT */}

        {chargement && (
          <p>
            Chargement des résultats...
          </p>
        )}

        {/* ERREUR */}

        {erreur && (
          <div className="resultats-erreur">
            ⚠️ {erreur}
          </div>
        )}

        {!chargement &&
          !erreur && (
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
                    {classe}
                  </strong>

                </div>

              </section>

              {/* ==================================
                  CHOIX DU TRIMESTRE
              ================================== */}

              <section className="resultats-filtres">

                <label htmlFor="trimestre">
                  Trimestre
                </label>

                <select
                  id="trimestre"
                  value={trimestre}
                  onChange={(e) =>
                    setTrimestre(
                      e.target.value
                    )
                  }
                >

                  <option value="Trimestre 1">
                    Trimestre 1
                  </option>

                  <option value="Trimestre 2">
                    Trimestre 2
                  </option>

                  <option value="Trimestre 3">
                    Trimestre 3
                  </option>

                </select>

              </section>

              {/* ==================================
                  NOTES
              ================================== */}

              <section className="resultats-card">

                <h2>
                  {trimestre}
                </h2>

                {notesTrimestre.length === 0 ? (

                  <div className="aucun-resultat">

                    Aucune note disponible
                    pour ce trimestre.

                  </div>

                ) : (

                  <div className="resultats-table-container">

                    <table>

                      <thead>

                        <tr>

                          <th>
                            Matière
                          </th>

                          <th>
                            Note
                          </th>

                          <th>
                            Coefficient
                          </th>

                          <th>
                            Points
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {notesTrimestre.map(
                          (item) => (

                            <tr
                              key={item.id}
                            >

                              <td>
                                {item.matiere}
                              </td>

                              <td>

                                <strong>
                                  {Number(
                                    item.note
                                  ).toFixed(2)}

                                  {' / 20'}
                                </strong>

                              </td>

                              <td>
                                {Number(
                                  item.coefficient
                                ).toFixed(2)}
                              </td>

                              <td>
                                {(
                                  Number(
                                    item.note
                                  ) *
                                  Number(
                                    item.coefficient
                                  )
                                ).toFixed(2)}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

              {/* ==================================
                  MOYENNE
              ================================== */}

              {notesTrimestre.length > 0 && (

                <section className="moyenne-card">

                  <span>
                    Moyenne générale
                  </span>

                  <strong>
                    {moyenne.toFixed(2)}
                    {' / 20'}
                  </strong>

                </section>

              )}

              {/* ==================================
                  BULLETINS
              ================================== */}

              <section className="bulletins-card">

                <div className="bulletins-header">

                  <div>

                    <h2>
                      📄 Mes bulletins
                    </h2>

                    <p>
                      Retrouvez vos bulletins scolaires.
                    </p>

                  </div>

                </div>

                {bulletins.length === 0 ? (

                  <div className="aucun-bulletin">

                    <span>
                      📄
                    </span>

                    <p>
                      Aucun bulletin disponible
                      pour le moment.
                    </p>

                  </div>

                ) : (

                  <div className="bulletins-list">

                    {bulletins.map(
                      (bulletin) => (

                        <div
                          className="bulletin-item"
                          key={bulletin.id}
                        >

                          <div className="bulletin-icon">
                            📄
                          </div>

                          <div className="bulletin-info">

                            <h3>
                              {bulletin.titre}
                            </h3>

                            <span>
                              {bulletin.periode}
                            </span>

                          </div>

                          <div className="bulletin-actions">

                            <button
                              type="button"
                              onClick={() =>
                                ouvrirBulletin(
                                  bulletin.id
                                )
                              }
                            >
                              👁 Voir le PDF
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                telechargerBulletin(
                                  bulletin.id,
                                  bulletin.titre
                                )
                              }
                            >
                              ⬇ Télécharger
                            </button>
                          

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}
                

              </section>

            </>
          )}
            <br /><br />

      </main>

    </div>
  );
}
