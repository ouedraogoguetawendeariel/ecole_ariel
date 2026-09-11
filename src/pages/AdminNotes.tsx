import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AdminNotes.css';

const API_URL = 'http://localhost:5000';

interface Eleve {
  id: number;
  prenom: string;
  nom: string;
  classe: string;
}

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

export default function AdminNotes() {
  const navigate = useNavigate();

  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [matiere, setMatiere] = useState('');
  const [coefficient, setCoefficient] = useState('1');
  const [trimestre, setTrimestre] = useState('Trimestre 1');

  const [notesSaisies, setNotesSaisies] =
    useState<Record<number, string>>({});

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  /* =====================================================
     Chargement des données
  ===================================================== */

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const token = localStorage.getItem('token');

        const [resEleves, resNotes, resClasses] = await Promise.all([
          fetch(`${API_URL}/api/admin/eleves`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/api/notes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/api/admin/classes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const dataEleves = await resEleves.json();
        const dataNotes = await resNotes.json();
        const dataClasses = await resClasses.json();

        if (!resEleves.ok) {
          setErreur(
            dataEleves.message ||
            'Impossible de récupérer les élèves.'
          );
          return;
        }

        if (!resNotes.ok) {
          setErreur(
            dataNotes.message ||
            'Impossible de récupérer les notes.'
          );
          return;
        }

        if (!resClasses.ok) {
          setErreur(
            dataClasses.message ||
            'Impossible de récupérer les classes.'
          );
          return;
        }

        setEleves(dataEleves.eleves || []);
        setNotes(dataNotes.notes || []);
        setClasses(dataClasses.classes || []);

      } catch {
        setErreur('Impossible de contacter le serveur.');
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  /* =====================================================
     Élèves de la classe sélectionnée
  ===================================================== */

  const elevesDeLaClasse = eleves.filter(
    (eleve) => eleve.classe === classeSelectionnee
  );

  /* =====================================================
     Modifier une note
  ===================================================== */

  const modifierNote = (eleveId: number, valeur: string) => {
    setNotesSaisies((anciennesNotes) => ({
      ...anciennesNotes,
      [eleveId]: valeur,
    }));
  };

  /* =====================================================
     Enregistrer toutes les notes
  ===================================================== */

  const handleEnregistrerNotes = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErreur('');
    setMessage('');

    if (!classeSelectionnee) {
      setErreur('Veuillez sélectionner une classe.');
      return;
    }

    if (!matiere.trim()) {
      setErreur('Veuillez saisir la matière.');
      return;
    }

    const coefficientNumber = Number(coefficient);

    if (!coefficientNumber || coefficientNumber <= 0) {
      setErreur('Le coefficient doit être supérieur à 0.');
      return;
    }

    const notesAEnregistrer = elevesDeLaClasse
      .filter(
        (eleve) =>
          notesSaisies[eleve.id] !== undefined &&
          notesSaisies[eleve.id] !== ''
      )
      .map((eleve) => ({
        eleveId: eleve.id,
        note: Number(notesSaisies[eleve.id]),
      }));

    if (notesAEnregistrer.length === 0) {
      setErreur(
        'Veuillez saisir au moins une note avant d’enregistrer.'
      );
      return;
    }

    // Vérification des notes
    for (const item of notesAEnregistrer) {
      if (
        !Number.isFinite(item.note) ||
        item.note < 0 ||
        item.note > 20
      ) {
        const eleve = elevesDeLaClasse.find(
          (e) => e.id === item.eleveId
        );

        setErreur(
          `La note de ${eleve?.prenom || ''} ${eleve?.nom || ''} doit être comprise entre 0 et 20.`
        );

        return;
      }
    }

    try {
      setEnregistrement(true);

      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_URL}/api/notes/classe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            classe: classeSelectionnee,
            matiere: matiere.trim(),
            coefficient: coefficientNumber,
            trimestre,
            notes: notesAEnregistrer,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErreur(
          data.message ||
          'Impossible d’enregistrer les notes.'
        );
        return;
      }

      setMessage(
        data.message ||
        'Notes enregistrées avec succès.'
      );

      // Recharger les notes
      const resNotes = await fetch(
        `${API_URL}/api/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataNotes = await resNotes.json();

      if (resNotes.ok) {
        setNotes(dataNotes.notes || []);
      }

      // Vider les champs de notes
      setNotesSaisies({});

    } catch {
      setErreur('Impossible de contacter le serveur.');
    } finally {
      setEnregistrement(false);
    }
  };

  /* =====================================================
     Changement de classe
  ===================================================== */

  const handleClasseChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setClasseSelectionnee(e.target.value);
    setNotesSaisies({});
    setMessage('');
    setErreur('');
  };

  /* =====================================================
     Affichage
  ===================================================== */

  return (
    <div className="admin-notes">

      <header className="admin-notes-header">
        <div>
          <h1>Gestion des notes</h1>

          <p>
            Saisissez les notes de toute une classe.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin')}
        >
          ← Retour
        </button>
      </header>

      <main className="admin-notes-content">

        {chargement && (
          <p>Chargement des données...</p>
        )}

        {erreur && (
          <div className="message-erreur">
            {erreur}
          </div>
        )}

        {message && (
          <div className="message-succes">
            {message}
          </div>
        )}

        {!chargement && (
          <>
            {/* =================================================
                FORMULAIRE
            ================================================= */}

            <section className="note-form-card">

              <h2>
                Saisie des notes
              </h2>

              <form
                onSubmit={handleEnregistrerNotes}
              >

                {/* Classe */}

                <div className="form-group">

                  <label>
                    Classe
                  </label>

                  <select
                    value={classeSelectionnee}
                    onChange={handleClasseChange}
                  >

                    <option value="">
                      -- Sélectionner une classe --
                    </option>

                    {classes.map((classe) => (
                      <option
                        key={classe}
                        value={classe}
                      >
                        {classe}
                      </option>
                    ))}

                  </select>

                </div>


                {/* Matière */}

                <div className="form-group">

                  <label>
                    Matière
                  </label>

                  <input
                    type="text"
                    value={matiere}
                    onChange={(e) =>
                      setMatiere(e.target.value)
                    }
                    placeholder="Exemple : Mathématiques"
                  />

                </div>


                {/* Trimestre + coefficient */}

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Trimestre
                    </label>

                    <select
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

                  </div>


                  <div className="form-group">

                    <label>
                      Coefficient
                    </label>

                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={coefficient}
                      onChange={(e) =>
                        setCoefficient(e.target.value)
                      }
                    />

                  </div>

                </div>


                {/* =================================================
                    LISTE DES ÉLÈVES
                ================================================= */}

                {classeSelectionnee && (

                  <div className="saisie-classe">

                    <h3>
                      Élèves de la classe :
                      {' '}
                      {classeSelectionnee}
                    </h3>

                    {elevesDeLaClasse.length === 0 ? (

                      <div className="classe-vide">
                        Aucun élève trouvé dans cette classe.
                      </div>

                    ) : (

                      <div className="notes-saisie-table">

                        <table>

                          <thead>

                            <tr>
                              <th>#</th>
                              <th>Élève</th>
                              <th>Note / 20</th>
                            </tr>

                          </thead>

                          <tbody>

                            {elevesDeLaClasse.map(
                              (eleve, index) => (

                                <tr key={eleve.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    <strong>
                                      {eleve.prenom}{' '}
                                      {eleve.nom}
                                    </strong>
                                  </td>

                                  <td>

                                    <input
                                      className="note-input"
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.01"
                                      placeholder="--"
                                      value={
                                        notesSaisies[
                                          eleve.id
                                        ] ?? ''
                                      }
                                      onChange={(e) =>
                                        modifierNote(
                                          eleve.id,
                                          e.target.value
                                        )
                                      }
                                    />

                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </div>

                )}


                {/* Bouton */}

                {classeSelectionnee &&
                  elevesDeLaClasse.length > 0 && (

                    <button
                      type="submit"
                      className="btn-enregistrer"
                      disabled={enregistrement}
                    >

                      {enregistrement
                        ? 'Enregistrement...'
                        : 'Enregistrer les notes'}

                    </button>

                  )}

              </form>

            </section>


            {/* =================================================
                NOTES EXISTANTES
            ================================================= */}

            <section className="notes-list-card">

              <h2>
                Notes enregistrées
              </h2>

              {notes.length === 0 ? (

                <div className="aucune-note">
                  Aucune note enregistrée pour le moment.
                </div>

              ) : (

                <div className="table-container">

                  <table>

                    <thead>

                      <tr>
                        <th>Élève</th>
                        <th>Classe</th>
                        <th>Matière</th>
                        <th>Note</th>
                        <th>Coeff.</th>
                        <th>Trimestre</th>
                      </tr>

                    </thead>

                    <tbody>

                      {notes.map((item) => (

                        <tr key={item.id}>

                          <td>
                            {item.prenom &&
                            item.nom
                              ? `${item.prenom} ${item.nom}`
                              : `Élève #${item.eleve_id}`}
                          </td>

                          <td>
                            {item.classe || '-'}
                          </td>

                          <td>
                            {item.matiere}
                          </td>

                          <td>
                            <strong>
                              {item.note}/20
                            </strong>
                          </td>

                          <td>
                            {item.coefficient}
                          </td>

                          <td>
                            {item.trimestre}
                          </td>

                        </tr>

                      ))}

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