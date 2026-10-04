import { useEffect, useState } from 'react';
import '../Css/AdminTheme.css';
import '../Css/EmploiDuTempsGrid.css';
import AdminHeader from '../components/AdminHeader';
import EmploiDuTempsGrid from '../components/EmploiDuTempsGrid';


const API_URL = import.meta.env.VITE_API_URL;

interface Creneau {
  id: number;
  classe: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  matiere: string;
  salle: string | null;
}

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function AdminEmploiDuTemps() {
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [classeRecherchee, setClasseRecherchee] = useState('6ème A');

  const [classe, setClasse] = useState('');
  const [jour, setJour] = useState('Lundi');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [matiere, setMatiere] = useState('');
  const [salle, setSalle] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const chargerCreneaux = async () => {
    if (!classeRecherchee) return;
    try {
      const response = await fetch(
        `${API_URL}/api/emploiDuTemps?classe=${encodeURIComponent(classeRecherchee)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');
      setCreneaux(data.creneaux || []);
    } catch (error) {
      console.error(error);
      setMessage('Impossible de charger l’emploi du temps.');
    }
  };

  useEffect(() => {
    chargerCreneaux();
  }, [classeRecherchee]);

  const resetForm = () => {
    setClasse(''); setJour('Lundi'); setHeureDebut(''); setHeureFin('');
    setMatiere(''); setSalle(''); setEditingId(null);
  };

  const enregistrerCreneau = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!classe || !jour || !heureDebut || !heureFin || !matiere) {
      setMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const url = editingId ? `${API_URL}/api/emploiDuTemps/${editingId}` : `${API_URL}/api/emploiDuTemps`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classe, jour, heureDebut, heureFin, matiere, salle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');

      setMessage(editingId ? 'Créneau modifié avec succès.' : 'Créneau ajouté avec succès.');
      resetForm();
      setClasseRecherchee(classe);
      chargerCreneaux();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
    }
  };

  const modifierCreneau = (creneau: Creneau) => {
    setEditingId(creneau.id);
    setClasse(creneau.classe);
    setJour(creneau.jour);
    setHeureDebut(creneau.heure_debut.substring(0, 5));
    setHeureFin(creneau.heure_fin.substring(0, 5));
    setMatiere(creneau.matiere);
    setSalle(creneau.salle || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const supprimerCreneau = async (id: number) => {
    const confirmation = window.confirm('Voulez-vous vraiment supprimer ce créneau ?');
    if (!confirmation) return;

    try {
      const response = await fetch(`${API_URL}/api/emploiDuTemps/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');
      setMessage('Créneau supprimé avec succès.');
      chargerCreneaux();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Impossible de supprimer le créneau.');
    }
  };

  return (
    <div className="admin-eleves admin-theme">
      <AdminHeader titre="Gestion de l'emploi du temps" />

      <main className="admin-eleves-content">
        {message && <p style={{ fontWeight: 'bold', margin: '15px 0' }}>{message}</p>}

        <form onSubmit={enregistrerCreneau} style={{ maxWidth: '650px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', marginBottom: '30px', background: '#a7a296' }}>
          <h2>{editingId ? '✏️ Modifier un créneau' : '➕ Ajouter un créneau'}</h2>

          <label>Classe *</label>
          <input type="text" value={classe} onChange={(e) => setClasse(e.target.value)} placeholder="Ex : 6ème A" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />

          <label>Jour *</label>
          <select value={jour} onChange={(e) => setJour(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px' }}>
            {jours.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>

          <label>Heure de début *</label>
          <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />

          <label>Heure de fin *</label>
          <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />

          <label>Matière *</label>
          <input type="text" value={matiere} onChange={(e) => setMatiere(e.target.value)} placeholder="Ex : Mathématiques" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />

          <label>Salle</label>
          <input type="text" value={salle} onChange={(e) => setSalle(e.target.value)} placeholder="Ex : Salle 4" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />

          <button type="submit">{editingId ? 'Enregistrer les modifications' : 'Ajouter le créneau'}</button>
          {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>Annuler</button>}
        </form>

        <div style={{ marginBottom: '25px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', background: '#a7a296' }}>
          <h2>🔎 Consulter une classe</h2>
          <input type="text" value={classeRecherchee} onChange={(e) => setClasseRecherchee(e.target.value)} placeholder="Ex : 6ème A" style={{ padding: '10px', width: '300px', maxWidth: '100%' }} />
        </div>

        <h2>📅 Emploi du temps — {classeRecherchee}</h2>
                   {creneaux.length === 0 ? (
          <p>Aucun créneau enregistré pour cette classe.</p>
        ) : (
          <EmploiDuTempsGrid
            creneaux={creneaux}
            onModifier={modifierCreneau}
            onSupprimer={supprimerCreneau}
          />
        )}
        
      </main>
    </div>
  );
}
