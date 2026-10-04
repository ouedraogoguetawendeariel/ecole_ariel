import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Absences.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Absence {
  id: number;
  eleve_id: number;
  prenom: string;
  nom: string;
  classe: string;
  date_absence: string;
  matiere: string;
  heure_debut: string;
  heure_fin: string;
  type: 'absence' | 'retard';
  motif: string | null;
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

export default function Absences() {
  const navigate = useNavigate();

  const [absences, setAbsences] =
    useState<Absence[]>([]);

  const [user, setUser] =
    useState<User | null>(null);

  const [enfant, setEnfant] =
    useState<Enfant | null>(null);

  const [classe, setClasse] =
    useState('');

  const [chargement, setChargement] =
    useState(true);

  const [erreur, setErreur] =
    useState('');

  // ==========================================
  // CHARGER LES ABSENCES
  // ==========================================

  useEffect(() => {
    const chargerAbsences = async () => {
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

        // ======================================
        // CLASSE DE L'ÉLÈVE
        // ======================================

        if (
          utilisateur.role === 'eleve'
        ) {
          if (!utilisateur.classe) {
            throw new Error(
              "La classe de l'élève n'est pas renseignée."
            );
          }

          setClasse(
            utilisateur.classe
          );
        }

        // ======================================
        // ENFANT DU PARENT
        // ======================================

        if (
          utilisateur.role === 'parent'
        ) {
          const enfantsResponse =
            await fetch(
              `${API_URL}/api/children`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
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

          // Premier enfant pour le moment
          const premierEnfant =
            enfants[0];

          setEnfant(
            premierEnfant
          );

          setClasse(
            premierEnfant.classe
          );
        }

        // ======================================
        // RÉCUPÉRER LES ABSENCES
        // ======================================

        const response =
          await fetch(
            `${API_URL}/api/absences/mes-absences`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Impossible de récupérer les absences.'
          );
        }

        setAbsences(
          data.absences || []
        );

      } catch (error) {
        console.error(
          'Erreur absences :',
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

    chargerAbsences();
  }, [navigate]);

  // ==========================================
  // NOM / PRÉNOM
  // ==========================================

  const nom =
    user?.role === 'parent'
      ? enfant?.nom || '-'
      : user?.nom || '-';

  const prenom =
    user?.role === 'parent'
      ? enfant?.prenom || '-'
      : user?.prenom || '-';

  // ==========================================
  // FORMATER DATE
  // ==========================================

  function formaterDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  }

  // ==========================================
  // FORMATER HEURE
  // ==========================================

  function formaterHeure(
    heure: string
  ) {
    if (!heure) {
      return '-';
    }

    return heure.slice(0, 5);
  }

  // ==========================================
  // COMPTER ABSENCES / RETARDS
  // ==========================================

  const nombreAbsences =
    absences.filter(
      (item) =>
        item.type === 'absence'
    ).length;

  const nombreRetards =
    absences.filter(
      (item) =>
        item.type === 'retard'
    ).length;

  // ==========================================
  // AFFICHAGE
  // ==========================================

  return (
    <div className="absences-page">

      {/* ======================================
          EN-TÊTE
      ====================================== */}

      <header className="absences-header">

        <div>

          <h1>
            📋 Mes absences
          </h1>

          <p>
            Consultez les absences et retards
            enregistrés par l'établissement.
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

      <main className="absences-content">

        {/* ======================================
            CHARGEMENT
        ====================================== */}

        {chargement && (
          <div className="absences-loading">
            Chargement des absences...
          </div>
        )}

        {/* ======================================
            ERREUR
        ====================================== */}

        {erreur && (
          <div className="absences-erreur">
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
                    {classe || '-'}
                  </strong>

                </div>

              </section>

              {/* ==================================
                  STATISTIQUES
              ================================== */}

              <section className="absences-statistiques">

                <div className="statistique-card">

                  <span className="statistique-icon">
                    ❌
                  </span>

                  <div>

                    <span>
                      Absences
                    </span>

                    <strong>
                      {nombreAbsences}
                    </strong>

                  </div>

                </div>

                <div className="statistique-card">

                  <span className="statistique-icon">
                    ⏰
                  </span>

                  <div>

                    <span>
                      Retards
                    </span>

                    <strong>
                      {nombreRetards}
                    </strong>

                  </div>

                </div>

                <div className="statistique-card">

                  <span className="statistique-icon">
                    📋
                  </span>

                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      {absences.length}
                    </strong>

                  </div>

                </div>

              </section>

              {/* ==================================
                  LISTE
              ================================== */}

              <section className="absences-card">

                <div className="absences-card-header">

                  <div>

                    <h2>
                      📋 Historique
                    </h2>

                    <p>
                      Historique des absences
                      et retards.
                    </p>

                  </div>

                  <span className="absences-count">
                    {absences.length}
                  </span>

                </div>

                {absences.length === 0 ? (

                  <div className="aucune-absence">

                    <span>
                      ✅
                    </span>

                    <h3>
                      Aucune absence
                    </h3>

                    <p>
                      Aucune absence ou retard
                      n'est enregistré pour
                      le moment.
                    </p>

                  </div>

                ) : (

                  <div className="absences-table-container">

                    <table>

                      <thead>

                        <tr>

                          <th>
                            Date
                          </th>

                          <th>
                            Matière
                          </th>

                          <th>
                            Horaire
                          </th>

                          <th>
                            Type
                          </th>

                          <th>
                            Motif
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {absences.map(
                          (absence) => (

                            <tr
                              key={absence.id}
                            >

                              <td>

                                <strong>
                                  {formaterDate(
                                    absence.date_absence
                                  )}
                                </strong>

                              </td>

                              <td>
                                {absence.matiere ||
                                  '-'}
                              </td>

                              <td>

                                {formaterHeure(
                                  absence.heure_debut
                                )}

                                {' - '}

                                {formaterHeure(
                                  absence.heure_fin
                                )}

                              </td>

                              <td>

                                {absence.type ===
                                'absence' ? (

                                  <span className="badge-absence">
                                    ❌ Absence
                                  </span>

                                ) : (

                                  <span className="badge-retard">
                                    ⏰ Retard
                                  </span>

                                )}

                              </td>

                              <td>
                                {absence.motif ||
                                  '-'}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

            </>
          )}

      </main>

    </div>
  );
}
