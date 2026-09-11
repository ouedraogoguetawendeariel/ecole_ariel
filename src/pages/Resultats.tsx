import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Resultats.css';

const API_URL = 'http://localhost:5000';

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
  classe?: string;
  role?: string;
}

export default function Resultats() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [trimestre, setTrimestre] = useState('Trimestre 1');

  const [user, setUser] = useState<User | null>(null);

  // ================================
  // UTILISATEUR CONNECTÉ
  // ================================

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ================================
  // CHARGER NOTES + BULLETINS
  // ================================

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/connexion');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // ============================
        // NOTES
        // ============================

        const notesRes = await fetch(
          `${API_URL}/api/notes`,
          { headers }
        );

        const notesData = await notesRes.json();

        if (!notesRes.ok) {
          setErreur(
            notesData.message ||
            'Impossible de récupérer les notes.'
          );
          return;
        }

        setNotes(notesData.notes || []);

        // ============================
        // BULLETINS
        // ============================

        const bulletinsRes = await fetch(
          `${API_URL}/api/bulletins`,
          { headers }
        );

        const bulletinsData = await bulletinsRes.json();

        if (!bulletinsRes.ok) {
          setErreur(
            bulletinsData.message ||
            'Impossible de récupérer les bulletins.'
          );
          return;
        }

        setBulletins(bulletinsData.bulletins || []);

      } catch {
        setErreur(
          'Impossible de contacter le serveur.'
        );
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, [navigate]);

  // ================================
  // NOTES DU TRIMESTRE
  // ================================

  const notesTrimestre = notes.filter(
    (item) => item.trimestre === trimestre
  );

  // ================================
  // INFORMATIONS ÉLÈVE
  // ================================

  const eleve = notesTrimestre[0];

  const nom =
    user?.role === 'eleve'
      ? user.nom || '-'
      : eleve?.nom || bulletins[0]?.nom || '-';

  const prenom =
    user?.role === 'eleve'
      ? user.prenom || '-'
      : eleve?.prenom || bulletins[0]?.prenom || '-';

  const classe =
    user?.role === 'eleve'
      ? user.classe || '-'
      : eleve?.classe || bulletins[0]?.classe || '-';

  // ================================
  // MOYENNE
  // ================================

  const totalPoints = notesTrimestre.reduce(
    (total, item) =>
      total +
      Number(item.note) *
      Number(item.coefficient),
    0
  );

  const totalCoefficients = notesTrimestre.reduce(
    (total, item) =>
      total +
      Number(item.coefficient),
    0
  );

  const moyenne =
    totalCoefficients > 0
      ? totalPoints / totalCoefficients
      : 0;

  // ================================
  // OUVRIR LE PDF
  // ================================

  const ouvrirBulletin = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ================================
  // AFFICHAGE
  // ================================

  return (
    <div className="resultats-page">

      {/* ================================
          EN-TÊTE
      ================================= */}

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

        {/* ================================
            CHARGEMENT
        ================================= */}

        {chargement && (
          <p>
            Chargement des résultats...
          </p>
        )}


        {/* ================================
            ERREUR
        ================================= */}

        {erreur && (
          <div className="resultats-erreur">
            {erreur}
          </div>
        )}


        {!chargement && !erreur && (
          <>

            {/* ================================
                INFORMATIONS ÉLÈVE
            ================================= */}

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


            {/* ================================
                CHOIX DU TRIMESTRE
            ================================= */}

            <section className="resultats-filtres">

              <label htmlFor="trimestre">
                Trimestre
              </label>

              <select
                id="trimestre"
                value={trimestre}
                onChange={(e) =>
                  setTrimestre(e.target.value)
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


            {/* ================================
                NOTES
            ================================= */}

            <section className="resultats-card">

              <h2>
                {trimestre}
              </h2>


              {notesTrimestre.length === 0 ? (

                <div className="aucun-resultat">
                  Aucune note disponible pour ce trimestre.
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

                      {notesTrimestre.map((item) => (

                        <tr key={item.id}>

                          <td>
                            {item.matiere}
                          </td>

                          <td>

                            <strong>
                              {Number(item.note).toFixed(2)}
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
                              Number(item.note) *
                              Number(item.coefficient)
                            ).toFixed(2)}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </section>


            {/* ================================
                MOYENNE
            ================================= */}

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


            {/* ================================
                BULLETINS PDF
            ================================= */}

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
                    Aucun bulletin disponible pour le moment.
                  </p>

                </div>

              ) : (

                <div className="bulletins-list">

                  {bulletins.map((bulletin) => (

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
                              bulletin.fichier_url
                            )
                          }
                        >
                          👁 Voir le PDF
                        </button>

                        <a
                          href={bulletin.fichier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          ⬇ Télécharger
                        </a>

                      </div>

                    </div>

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