import { useEffect, useState } from 'react';
import '../Css/AdminNotes.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

interface Eleve {
  id: number;
  prenom: string;
  nom: string;
  classe: string | null;
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
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [matiere, setMatiere] = useState('');
  const [coefficient, setCoefficient] = useState('1');
  const [trimestre, setTrimestre] = useState('Trimestre 1');

  const [notesSaisies, setNotesSaisies] = useState<Record<number, string>>({});
  const [noteEnCoursModification, setNoteEnCoursModification] = useState<Note | null>(null);

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  // =====================================================
  // NORMALISER UNE CLASSE
  // =====================================================
  const normaliserClasse = (classe: string | null | undefined) => {
    return (classe || '').trim().toLowerCase();
  };

  // =====================================================
  // CHARGER LES DONNÉES
  // =====================================================
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        setChargement(true);
        setErreur('');

        const token = localStorage.getItem('token');

        if (!token) {
          setErreur('Vous devez être connecté pour accéder aux notes.');
          return;
        }

        const [resEleves, resNotes] = await Promise.all([
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
        ]);

        const dataEleves = await resEleves.json();
        const dataNotes = await resNotes.json();

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

        const listeEleves: Eleve[] = dataEleves.eleves || [];

        setEleves(listeEleves);
        setNotes(dataNotes.notes || []);

        const classesUniques = Array.from(
          new Set(
            listeEleves
              .map((eleve) => eleve.classe?.trim())
              .filter(
                (classe): classe is string =>
                  Boolean(classe && classe.trim() !== '')
              )
          )
        ).sort((a, b) => a.localeCompare(b));

        setClasses(classesUniques);
      } catch (error) {
        console.error('Erreur chargement notes :', error);

        setErreur(
          'Impossible de contacter le serveur.'
        );
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  // =====================================================
  // ÉLÈVES DE LA CLASSE SÉLECTIONNÉE
  // =====================================================

  const elevesDeLaClasse = eleves.filter((eleve) => {
    return (
      normaliserClasse(eleve.classe) ===
      normaliserClasse(classeSelectionnee)
    );
  });

  // =====================================================
  // MODIFIER UNE NOTE (SAISIE CLASSE)
  // =====================================================

  const modifierNote = (
    eleveId: number,
    valeur: string
  ) => {
    setNotesSaisies((anciennes) => ({
      ...anciennes,
      [eleveId]: valeur,
    }));
  };

  // =====================================================
  // SUPPRIMER UNE NOTE
  // =====================================================

  const supprimerNote = async (idNote: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette note ?')) {
      return;
    }

    try {
      setErreur('');
      setMessage('');

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/notes/${idNote}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.message || 'Impossible de supprimer la note.');
        return;
      }

      setNotes((notesActuelles) => notesActuelles.filter((n) => n.id !== idNote));
      setMessage('Note supprimée avec succès.');
    } catch (error) {
      console.error('Erreur suppression note :', error);
      setErreur('Impossible de contacter le serveur.');
    }
  };

  // =====================================================
  // ENREGISTRER LA MODIFICATION D'UNE NOTE (PUT)
  // =====================================================

  const handleModifierNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteEnCoursModification) return;

    try {
      setErreur('');
      setMessage('');

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/notes/${noteEnCoursModification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matiere: noteEnCoursModification.matiere,
          note: noteEnCoursModification.note,
          coefficient: noteEnCoursModification.coefficient,
          trimestre: noteEnCoursModification.trimestre,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.message || 'Impossible de modifier la note.');
        return;
      }

      setNotes((notesActuelles) =>
        notesActuelles.map((n) => (n.id === noteEnCoursModification.id ? data.note : n))
      );

      setMessage('Note modifiée avec succès.');
      setNoteEnCoursModification(null);
    } catch (error) {
      console.error('Erreur modification note :', error);
      setErreur('Impossible de contacter le serveur.');
    }
  };

  // =====================================================
  // CHANGER DE CLASSE
  // =====================================================

  const handleClasseChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nouvelleClasse = e.target.value;

    setClasseSelectionnee(nouvelleClasse);
    setNotesSaisies({});
    setMessage('');
    setErreur('');
  };

  // =====================================================
  // ENREGISTRER LES NOTES
  // =====================================================

  const handleEnregistrerNotes = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErreur('');
    setMessage('');

    if (!classeSelectionnee) {
      setErreur(
        'Veuillez sélectionner une classe.'
      );
      return;
    }

    if (!matiere.trim()) {
      setErreur(
        'Veuillez saisir la matière.'
      );
      return;
    }

    const coefficientNumber = Number(coefficient);

    if (
      !coefficientNumber ||
      coefficientNumber <= 0
    ) {
      setErreur(
        'Le coefficient doit être supérieur à 0.'
      );
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
          `La note de ${eleve?.prenom || ''} ${
            eleve?.nom || ''
          } doit être comprise entre 0 et 20.`
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

      setNotesSaisies({});
    } catch (error) {
      console.error(
        'Erreur enregistrement notes :',
        error
      );

      setErreur(
        'Impossible de contacter le serveur.'
      );
    } finally {
      setEnregistrement(false);
    }
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="admin-eleves">
      <AdminHeader
        titre="Gestion des notes"
        sousTitre="Saisissez les notes de toute une classe."
      />

      <main className="admin-eleves-content">

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
            {/* FORMULAIRE DE SAISIE */}
            <section className="note-form-card">

              <h2>Saisie des notes</h2>

              <form onSubmit={handleEnregistrerNotes}>

                <div className="form-group">
                  <label htmlFor="classe">
                    Classe
                  </label>

                  <select
                    id="classe"
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

                <div className="form-group">
                  <label htmlFor="matiere">
                    Matière
                  </label>

                  <input
                    id="matiere"
                    type="text"
                    value={matiere}
                    onChange={(e) =>
                      setMatiere(e.target.value)
                    }
                    placeholder="Exemple : Mathématiques"
                  />
                </div>

                <div className="form-row">

                  <div className="form-group">
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
                  </div>

                  <div className="form-group">
                    <label htmlFor="coefficient">
                      Coefficient
                    </label>

                    <input
                      id="coefficient"
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

                {classeSelectionnee && (
                  <div className="saisie-classe">

                    <h3>
                      Élèves de la classe :{' '}
                      {classeSelectionnee}
                    </h3>

                    {elevesDeLaClasse.length === 0 ? (

                      <div className="classe-vide">
                        Aucun élève trouvé dans cette
                        classe.
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

            {/* NOTES DÉJÀ ENREGISTRÉES */}
            <section className="notes-list-card">

              <h2>Notes enregistrées</h2>

              {noteEnCoursModification && (
                <form onSubmit={handleModifierNoteSubmit} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <h3>Modifier la note de {noteEnCoursModification.prenom} {noteEnCoursModification.nom}</h3>
                  
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label>Matière</label>
                    <input
                      type="text"
                      value={noteEnCoursModification.matiere}
                      onChange={(e) => setNoteEnCoursModification({ ...noteEnCoursModification, matiere: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Note / 20</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.01"
                        value={noteEnCoursModification.note}
                        onChange={(e) => setNoteEnCoursModification({ ...noteEnCoursModification, note: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Coefficient</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={noteEnCoursModification.coefficient}
                        onChange={(e) => setNoteEnCoursModification({ ...noteEnCoursModification, coefficient: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Trimestre</label>
                      <select
                        value={noteEnCoursModification.trimestre}
                        onChange={(e) => setNoteEnCoursModification({ ...noteEnCoursModification, trimestre: e.target.value })}
                      >
                        <option value="Trimestre 1">Trimestre 1</option>
                        <option value="Trimestre 2">Trimestre 2</option>
                        <option value="Trimestre 3">Trimestre 3</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-enregistrer">Valider la modification</button>
                    <button type="button" onClick={() => setNoteEnCoursModification(null)} style={{ background: '#ccc', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Annuler</button>
                  </div>
                </form>
              )}

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
                        <th>Actions</th>
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

                          <td style={{ display: 'flex', gap: '5px' }}>
                            <button
                              type="button"
                              onClick={() => setNoteEnCoursModification(item)}
                              style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              className="btn-supprimer"
                              onClick={() => supprimerNote(item.id)}
                            >
                              Supprimer
                            </button>
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
