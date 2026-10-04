import { useEffect, useState } from 'react';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

type Parent = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  created_at: string;
  nombre_enfants: number;
};

type Eleve = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe: string | null;
};

type Enfant = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe: string | null;
};

export default function AdminParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);

  const [parentSelectionne, setParentSelectionne] = useState<Parent | null>(null);

  const [chargement, setChargement] = useState(true);
  const [chargementEnfants, setChargementEnfants] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enfantSelectionne, setEnfantSelectionne] = useState('');

  const [modeEdition, setModeEdition] = useState(false);
  const [parentEnModification, setParentEnModification] = useState<Parent | null>(null);

  const token = localStorage.getItem('token');

  const chargerParents = async () => {
    try {
      setChargement(true);
      const response = await fetch(`${API_URL}/api/admin/parents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement des parents.');
      }
      setParents(data.parents || []);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erreur lors du chargement des parents.');
    } finally {
      setChargement(false);
    }
  };

  const chargerEleves = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/eleves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement des élèves.');
      }
      setEleves(data.eleves || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    chargerParents();
    chargerEleves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prenom || !nom || !email) {
      alert('Veuillez remplir le prénom, le nom et l’email.');
      return;
    }
    if (!modeEdition && !password) {
      alert('Le mot de passe est obligatoire.');
      return;
    }

    if (!modeEdition && !enfantSelectionne) {
      alert('Veuillez sélectionner l’enfant du parent.');
      return;
    }

    try {
      const url = modeEdition && parentEnModification
        ? `${API_URL}/api/admin/parents/${parentEnModification.id}`
        : `${API_URL}/api/admin/parents`;

      const method = modeEdition ? 'PUT' : 'POST';

      const body: { prenom: string; nom: string; email: string; password?: string; childId?: number } = {
        prenom, nom, email,
      };

      if (!modeEdition) {
        body.childId = Number(enfantSelectionne);
      }
      if (password.trim() !== '') {
        body.password = password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue.');
      }

      alert(data.message);
      viderFormulaire();
      chargerParents();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue.');
    }
  };

  const modifierParent = (parent: Parent) => {
    setModeEdition(true);
    setParentEnModification(parent);
    setPrenom(parent.prenom || '');
    setNom(parent.nom || '');
    setEmail(parent.email || '');
    setPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const supprimerParent = async (parent: Parent) => {
    const confirmation = window.confirm(`Voulez-vous vraiment supprimer le parent ${parent.prenom} ${parent.nom} ?`);
    if (!confirmation) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/parents/${parent.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression.');
      }
      alert(data.message);
      if (parentSelectionne?.id === parent.id) {
        setParentSelectionne(null);
        setEnfants([]);
      }
      chargerParents();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression.');
    }
  };

  const gererEnfants = async (parent: Parent) => {
    try {
      setParentSelectionne(parent);
      setChargementEnfants(true);
      const response = await fetch(`${API_URL}/api/admin/parents/${parent.id}/enfants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement des enfants.');
      }
      setEnfants(data.enfants || []);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erreur lors du chargement des enfants.');
    } finally {
      setChargementEnfants(false);
    }
  };

  const associerEleve = async (childId: number) => {
    if (!parentSelectionne) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/parents/${parentSelectionne.id}/enfants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l’association.');
      }
      alert(data.message);
      await gererEnfants(parentSelectionne);
      chargerParents();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l’association.');
    }
  };

  const retirerEleve = async (childId: number) => {
    if (!parentSelectionne) return;

    const confirmation = window.confirm('Voulez-vous retirer cet élève de ce parent ?');
    if (!confirmation) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/parents/${parentSelectionne.id}/enfants/${childId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de l’association.');
      }
      alert(data.message);
      await gererEnfants(parentSelectionne);
      chargerParents();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression.');
    }
  };

  const viderFormulaire = () => {
    setPrenom('');
    setNom('');
    setEmail('');
    setPassword('');
    setEnfantSelectionne('');
    setModeEdition(false);
    setParentEnModification(null);
  };

  const enfantsIds = enfants.map((enfant) => enfant.id);
  const elevesDisponibles = eleves.filter((eleve) => !enfantsIds.includes(eleve.id));

  return (
    <div className="admin-eleves">
      <AdminHeader
        titre="Gestion des parents"
        sousTitre="Ajoutez, modifiez, supprimez les parents et gérez leurs enfants."
      />

      <main className="admin-eleves-content">

        <div
          style={{
            background: '#f5f7fa',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '30px',
          }}
        >
          <h2>{modeEdition ? '✏️ Modifier le parent' : '➕ Ajouter un parent'}</h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
              }}
            >
              <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
              <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input
                type="password"
                placeholder={modeEdition ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {!modeEdition && (
                <select
                  value={enfantSelectionne}
                  onChange={(e) => setEnfantSelectionne(e.target.value)}
                >
                  <option value="">Sélectionner l’enfant</option>
                  {eleves.map((eleve) => (
                    <option key={eleve.id} value={eleve.id}>
                      {eleve.prenom} {eleve.nom}{eleve.classe ? ` — ${eleve.classe}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ marginTop: '15px' }}>
              <button type="submit">
                {modeEdition ? '💾 Enregistrer les modifications' : '➕ Ajouter le parent'}
              </button>
              {modeEdition && (
                <button type="button" onClick={viderFormulaire} style={{ marginLeft: '10px' }}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2>📋 Liste des parents</h2>

          {chargement ? (
            <p>Chargement des parents...</p>
          ) : parents.length === 0 ? (
            <p>Aucun parent enregistré.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Nombre d'enfants</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent) => (
                    <tr key={parent.id}>
                      <td>{parent.prenom} {parent.nom}</td>
                      <td>{parent.email}</td>
                      <td style={{ textAlign: 'center' }}>{parent.nombre_enfants}</td>
                      <td>
                        <button onClick={() => gererEnfants(parent)}>👨‍👩‍👧 Gérer les enfants</button>
                        <button onClick={() => modifierParent(parent)} style={{ marginLeft: '8px' }}>✏️ Modifier</button>
                        <button onClick={() => supprimerParent(parent)} style={{ marginLeft: '8px' }}>🗑️ Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {parentSelectionne && (
          <div
            style={{
              marginTop: '35px',
              padding: '25px',
              background: '#eef4f8',
              borderRadius: '12px',
            }}
          >
            <h2>👨‍👩‍👧 Enfants de {parentSelectionne.prenom} {parentSelectionne.nom}</h2>

            {chargementEnfants ? (
              <p>Chargement des enfants...</p>
            ) : (
              <>
                <h3>Enfants associés</h3>

                {enfants.length === 0 ? (
                  <p>Aucun enfant n'est encore associé à ce parent.</p>
                ) : (
                  <ul>
                    {enfants.map((enfant) => (
                      <li key={enfant.id} style={{ marginBottom: '10px' }}>
                        <strong>{enfant.prenom} {enfant.nom}</strong>
                        {enfant.classe && <> — {enfant.classe}</>}
                        <button onClick={() => retirerEleve(enfant.id)} style={{ marginLeft: '15px' }}>
                          ❌ Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <hr />

                <h3>Ajouter un élève</h3>

                {elevesDisponibles.length === 0 ? (
                  <p>Tous les élèves sont déjà associés à ce parent.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {elevesDisponibles.map((eleve) => (
                      <div key={eleve.id}>
                        <span>{eleve.prenom} {eleve.nom}{eleve.classe && ` — ${eleve.classe}`}</span>
                        <button onClick={() => associerEleve(eleve.id)} style={{ marginLeft: '15px' }}>
                          ➕ Associer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setParentSelectionne(null); setEnfants([]); }}
                  style={{ marginTop: '20px' }}
                >
                  Fermer
                </button>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
