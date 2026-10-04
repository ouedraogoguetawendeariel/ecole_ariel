import { useEffect, useState } from 'react';
import '../Css/AdminAbsences.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

type Eleve = {
  id: number;
  prenom: string;
  nom: string;
  classe: string;
};

type Absence = {
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
};

export default function AdminAbsences() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);

  const [eleveId, setEleveId] = useState('');
  const [dateAbsence, setDateAbsence] = useState('');
  const [matiere, setMatiere] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [type, setType] = useState<'absence' | 'retard'>('absence');
  const [motif, setMotif] = useState('');

  const [absenceEnModification, setAbsenceEnModification] =
    useState<number | null>(null);

  const [classeRecherche, setClasseRecherche] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  async function chargerEleves() {
    try {
      const response = await fetch(`${API_URL}/api/admin/eleves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Impossible de récupérer les élèves.'
        );
        return;
      }

      setEleves(data.eleves || data);
    } catch (error) {
      console.error('Erreur chargement élèves :', error);
      setMessage('Erreur lors du chargement des élèves.');
    }
  }

  async function chargerAbsences() {
    try {
      const response = await fetch(`${API_URL}/api/absences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Impossible de récupérer les absences.'
        );
        return;
      }

      setAbsences(data.absences || []);
    } catch (error) {
      console.error('Erreur chargement absences :', error);
      setMessage('Erreur lors du chargement des absences.');
    }
  }

  useEffect(() => {
    chargerEleves();
    chargerAbsences();
  }, []);

  function reinitialiserFormulaire() {
    setEleveId('');
    setDateAbsence('');
    setMatiere('');
    setHeureDebut('');
    setHeureFin('');
    setType('absence');
    setMotif('');
    setAbsenceEnModification(null);
  }

  async function enregistrerAbsence(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (
      !eleveId ||
      !dateAbsence ||
      !matiere.trim() ||
      !heureDebut ||
      !heureFin ||
      !type
    ) {
      setMessage(
        "Veuillez remplir l'élève, la date, la matière, les heures et le type."
      );
      return;
    }

    if (heureFin <= heureDebut) {
      setMessage(
        "L'heure de fin doit être après l'heure de début."
      );
      return;
    }

    const donnees = {
      eleveId: Number(eleveId),
      dateAbsence,
      matiere: matiere.trim(),
      heureDebut,
      heureFin,
      type,
      motif: motif.trim() || null,
    };

    try {
      const url =
        absenceEnModification !== null
          ? `${API_URL}/api/absences/${absenceEnModification}`
          : `${API_URL}/api/absences`;

      const method =
        absenceEnModification !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donnees),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Erreur lors de l’enregistrement.'
        );
        return;
      }

      setMessage(
        absenceEnModification !== null
          ? 'Absence/retard modifié avec succès.'
          : 'Absence/retard enregistré avec succès.'
      );

      reinitialiserFormulaire();
      await chargerAbsences();
    } catch (error) {
      console.error('Erreur enregistrement absence :', error);
      setMessage('Erreur de connexion au serveur.');
    }
  }

  function modifierAbsence(absence: Absence) {
    setAbsenceEnModification(absence.id);
    setEleveId(String(absence.eleve_id));
    setDateAbsence(absence.date_absence.slice(0, 10));
    setMatiere(absence.matiere || '');
    setHeureDebut(absence.heure_debut?.slice(0, 5) || '');
    setHeureFin(absence.heure_fin?.slice(0, 5) || '');
    setType(absence.type);
    setMotif(absence.motif || '');

    setMessage(
      'Modification en cours. Vérifiez les informations puis enregistrez.'
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function supprimerAbsence(id: number) {
    const confirmation = window.confirm(
      'Voulez-vous vraiment supprimer cet enregistrement ?'
    );

    if (!confirmation) return;

    try {
      const response = await fetch(
        `${API_URL}/api/absences/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Erreur lors de la suppression.'
        );
        return;
      }

      setMessage('Enregistrement supprimé avec succès.');
      await chargerAbsences();
    } catch (error) {
      console.error('Erreur suppression :', error);
      setMessage('Erreur de connexion au serveur.');
    }
  }

  const absencesFiltrees = absences.filter(
    (a) =>
      !classeRecherche.trim() ||
      a.classe
        ?.toLowerCase()
        .includes(classeRecherche.toLowerCase())
  );

  const totalAbsences = absences.filter(
    (a) => a.type === 'absence'
  ).length;

  const totalRetards = absences.filter(
    (a) => a.type === 'retard'
  ).length;

  const totalEnregistrements = absences.length;

  function formaterDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  function formaterHeure(heure: string) {
    return heure ? heure.slice(0, 5) : '-';
  }

  return (
    <div className="admin-eleves admin-theme">

      <AdminHeader
        titre="Gestion des absences et retards"
        sousTitre="Enregistrez et consultez les absences et retards des élèves."
      />

      <main className="admin-eleves-content">

        {/* STATISTIQUES */}
        <div className="absence-statistiques">

          <div className="stat-card">
            <div className="stat-icon">📋</div>

            <div>
              <span className="stat-label">
                Total enregistrés
              </span>

              <strong>{totalEnregistrements}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❌</div>

            <div>
              <span className="stat-label">
                Absences
              </span>

              <strong>{totalAbsences}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>

            <div>
              <span className="stat-label">
                Retards
              </span>

              <strong>{totalRetards}</strong>
            </div>
          </div>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="message-succes">
            {message}
          </div>
        )}

        {/* FORMULAIRE */}
        <form
          onSubmit={enregistrerAbsence}
          className="absence-form"
        >

          <h2>
            {absenceEnModification !== null
              ? 'Modifier une absence ou un retard'
              : 'Ajouter une absence ou un retard'}
          </h2>

          <div className="form-grid">

            <div className="form-group">
              <label>Élève</label>

              <select
                value={eleveId}
                onChange={(e) => setEleveId(e.target.value)}
                required
              >
                <option value="">
                  -- Sélectionner un élève --
                </option>

                {eleves.map((eleve) => (
                  <option
                    key={eleve.id}
                    value={eleve.id}
                  >
                    {eleve.prenom} {eleve.nom} - {eleve.classe}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                value={dateAbsence}
                onChange={(e) =>
                  setDateAbsence(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Matière</label>

              <input
                type="text"
                value={matiere}
                onChange={(e) =>
                  setMatiere(e.target.value)
                }
                placeholder="Exemple : Mathématiques"
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>

              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as 'absence' | 'retard'
                  )
                }
                required
              >
                <option value="absence">
                  Absence
                </option>

                <option value="retard">
                  Retard
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Heure début</label>

              <input
                type="time"
                value={heureDebut}
                onChange={(e) =>
                  setHeureDebut(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Heure fin</label>

              <input
                type="time"
                value={heureFin}
                onChange={(e) =>
                  setHeureFin(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group form-full">
              <label>Motif</label>

              <textarea
                value={motif}
                onChange={(e) =>
                  setMotif(e.target.value)
                }
                placeholder="Exemple : Maladie, rendez-vous médical..."
                rows={3}
              />
            </div>

          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="btn-primary"
            >
              {absenceEnModification !== null
                ? 'Enregistrer les modifications'
                : 'Enregistrer'}
            </button>

            {absenceEnModification !== null && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  reinitialiserFormulaire();
                  setMessage('');
                }}
              >
                Annuler
              </button>
            )}

          </div>

        </form>

        {/* TABLEAU */}
        <div className="absences-table-container">

          <h2>
            Liste des absences et retards
          </h2>

          <div className="form-group recherche-classe">

            <label>
              Rechercher par classe
            </label>

            <input
              type="text"
              value={classeRecherche}
              onChange={(e) =>
                setClasseRecherche(e.target.value)
              }
              placeholder="Exemple : 5e"
            />

          </div>

          {absencesFiltrees.length === 0 ? (

            <p className="aucune-absence">
              Aucune absence ou retard enregistré.
            </p>

          ) : (

            <div className="table-scroll">

              <table className="absences-table">

                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Date</th>
                    <th>Matière</th>
                    <th>Heure début</th>
                    <th>Heure fin</th>
                    <th>Type</th>
                    <th>Motif</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {absencesFiltrees.map((absence) => (

                    <tr key={absence.id}>

                      <td>
                        {absence.prenom} {absence.nom}
                      </td>

                      <td>
                        {absence.classe}
                      </td>

                      <td>
                        {formaterDate(
                          absence.date_absence
                        )}
                      </td>

                      <td>
                        {absence.matiere}
                      </td>

                      <td>
                        {formaterHeure(
                          absence.heure_debut
                        )}
                      </td>

                      <td>
                        {formaterHeure(
                          absence.heure_fin
                        )}
                      </td>

                      <td>

                        <span
                          className={
                            absence.type === 'absence'
                              ? 'badge-absence'
                              : 'badge-retard'
                          }
                        >
                          {absence.type === 'absence'
                            ? 'Absence'
                            : 'Retard'}
                        </span>

                      </td>

                      <td>
                        {absence.motif || '-'}
                      </td>

                      <td>

                        <div className="actions-absence">

                          <button
                            className="btn-edit"
                            onClick={() =>
                              modifierAbsence(absence)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            className="btn-delete"
                            onClick={() =>
                              supprimerAbsence(absence.id)
                            }
                          >
                            Supprimer
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}
