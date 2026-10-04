import { useEffect, useState } from 'react';
import '../Css/AdminDevoirs.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

interface Devoir {
  id: number;
  classe: string;
  matiere: string;
  titre: string;
  description: string | null;
  date_devoir: string;
}

export default function AdminDevoirs() {
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);

  const [classe, setClasse] = useState('');
  const [matiere, setMatiere] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dateDevoir, setDateDevoir] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  // ==============================
  // CHARGER LES DEVOIRS
  // ==============================

  const chargerDevoirs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/devoirs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement');
      }

      setDevoirs(data.devoirs || []);
    } catch (error) {
      console.error(error);
      setMessage('Impossible de charger les devoirs.');
    }
  };

  useEffect(() => {
    chargerDevoirs();
  }, []);

  // ==============================
  // RÉINITIALISER LE FORMULAIRE
  // ==============================

  const resetForm = () => {
    setClasse('');
    setMatiere('');
    setTitre('');
    setDescription('');
    setDateDevoir('');
    setEditingId(null);
  };

  // ==============================
  // AJOUTER / MODIFIER
  // ==============================

  const enregistrerDevoir = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');

    if (!classe || !matiere || !titre || !dateDevoir) {
      setMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/api/devoirs/${editingId}`
        : `${API_URL}/api/devoirs`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classe,
          matiere,
          titre,
          description,
          date_devoir: dateDevoir,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur');
      }

      if (editingId) {
        setMessage('Devoir modifié avec succès.');
      } else {
        setMessage('Devoir ajouté avec succès.');
      }

      resetForm();
      await chargerDevoirs();
    } catch (error) {
      console.error(error);
      setMessage('Une erreur est survenue.');
    }
  };

  // ==============================
  // MODIFIER UN DEVOIR
  // ==============================

  const modifierDevoir = (devoir: Devoir) => {
    setEditingId(devoir.id);
    setClasse(devoir.classe);
    setMatiere(devoir.matiere);
    setTitre(devoir.titre);
    setDescription(devoir.description || '');
    setDateDevoir(devoir.date_devoir.substring(0, 10));

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ==============================
  // SUPPRIMER UN DEVOIR
  // ==============================

  const supprimerDevoir = async (id: number) => {
    const confirmation = window.confirm(
      'Voulez-vous vraiment supprimer ce devoir ?'
    );

    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/devoirs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur');
      }

      setMessage('Devoir supprimé avec succès.');

      await chargerDevoirs();
    } catch (error) {
      console.error(error);
      setMessage('Impossible de supprimer le devoir.');
    }
  };

  // ==============================
  // AFFICHAGE
  // ==============================

  return (
    <div className="admin-eleves">
      <AdminHeader
        titre="Gestion des devoirs"
        sousTitre="Ajoutez, modifiez et gérez les devoirs des élèves."
      />

      <main className="admin-eleves-content">

        {/* MESSAGE */}
        {message && (
          <div className="devoir-message">
            {message}
          </div>
        )}


{/* FORMULAIRE */}
<section className="devoir-section">

  <h2>
    {editingId
      ? '✏️ Modifier le devoir'
      : '➕ Ajouter un devoir'}
  </h2>

  <form
    onSubmit={enregistrerDevoir}
    className="devoir-form"
  >

    {/* CLASSE + MATIÈRE */}
    <div className="devoir-form-row">

      <div className="devoir-champ">
        <label htmlFor="classe">
          Classe *
        </label>

        <input
          id="classe"
          type="text"
          value={classe}
          onChange={(e) => setClasse(e.target.value)}
          placeholder="Ex : 6ème A"
        />
      </div>

      <div className="devoir-champ">
        <label htmlFor="matiere">
          Matière *
        </label>

        <input
          id="matiere"
          type="text"
          value={matiere}
          onChange={(e) => setMatiere(e.target.value)}
          placeholder="Ex : Mathématiques"
        />
      </div>

    </div>

    {/* TITRE + DATE */}
    <div className="devoir-form-row">

      <div className="devoir-champ">
        <label htmlFor="titre">
          Titre du devoir *
        </label>

        <input
          id="titre"
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex : Exercices sur les fractions"
        />
      </div>

      <div className="devoir-champ">
        <label htmlFor="dateDevoir">
          Date du devoir *
        </label>

        <input
          id="dateDevoir"
          type="date"
          value={dateDevoir}
          onChange={(e) => setDateDevoir(e.target.value)}
        />
      </div>

    </div>

    {/* DESCRIPTION */}
    <div className="devoir-champ devoir-champ-complet">

      <label htmlFor="description">
        Description
      </label>

      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Consignes du devoir..."
        rows={5}
      />

    </div>

    {/* BOUTONS */}
    <div className="devoir-form-buttons">

      <button
        type="submit"
        className="btn-enregistrer-devoir"
      >
        {editingId
          ? 'Enregistrer les modifications'
          : 'Ajouter le devoir'}
      </button>

      {editingId && (
        <button
          type="button"
          className="btn-annuler-devoir"
          onClick={resetForm}
        >
          Annuler
        </button>
      )}

    </div>

  </form>

</section>


        {/* LISTE */}
        <section className="devoirs-section">

{/* LISTE DES DEVOIRS */}

<h2>📋 Liste des devoirs</h2>

{devoirs.length === 0 ? (
  <p className="aucun-devoir">
    Aucun devoir enregistré.
  </p>
) : (
  <div className="devoirs-liste">

    {devoirs.map((devoir) => (
      <div
        key={devoir.id}
        className="devoir-card"
      >

        <h3>
          {devoir.titre}
        </h3>

        <p>
          <strong>Classe :</strong>{' '}
          {devoir.classe}
        </p>

        <p>
          <strong>Matière :</strong>{' '}
          {devoir.matiere}
        </p>

        <p>
          <strong>Date :</strong>{' '}
          {new Date(
            devoir.date_devoir
          ).toLocaleDateString('fr-FR')}
        </p>

        {devoir.description && (
          <p>
            <strong>Consigne :</strong>{' '}
            {devoir.description}
          </p>
        )}

        <div className="devoir-actions">

          <button
            type="button"
            onClick={() => modifierDevoir(devoir)}
          >
            ✏️ Modifier
          </button>

          <button
            type="button"
            onClick={() => supprimerDevoir(devoir.id)}
          >
            🗑️ Supprimer
          </button>

        </div>

      </div>
    ))}

  </div>
)}
      </section>

      </main>
    </div>
  );
}

