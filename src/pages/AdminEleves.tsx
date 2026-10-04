import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AdminEleves.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Eleve {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe: string;
  date_naissance: string | null;
  created_at?: string;
}

export default function AdminEleves() {
  const navigate = useNavigate();

  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  // ================================
  // AJOUT
  // ================================

  const [afficherFormulaire, setAfficherFormulaire] =
    useState(false);

  const [formulaire, setFormulaire] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    classe: '',
    date_naissance: '',
  });

  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  // ================================
  // MODIFICATION
  // ================================

  const [eleveEnModification, setEleveEnModification] =
    useState<Eleve | null>(null);

  const [formulaireModification, setFormulaireModification] =
    useState({
      prenom: '',
      nom: '',
      email: '',
      password: '',
      classe: '',
      date_naissance: '',
    });

  const [modificationEnCours, setModificationEnCours] =
    useState(false);

  // ================================
  // RÉCUPÉRER LES ÉLÈVES
  // ================================

  const recupererEleves = async () => {
    try {
      setChargement(true);
      setErreur('');

      const token = localStorage.getItem('token');

      if (!token) {
        setErreur('Vous devez être connecté en tant qu’administrateur.');
        return;
      }

      const res = await fetch(
        `${API_URL}/api/admin/eleves`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErreur(
          data.message ||
            'Impossible de récupérer les élèves.'
        );
        return;
      }

      setEleves(data.eleves);

    } catch (error) {
      console.error(
        'Erreur récupération élèves :',
        error
      );

      setErreur(
        'Impossible de contacter le serveur.'
      );

    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    recupererEleves();
  }, []);

  // ================================
  // AJOUTER UN ÉLÈVE
  // ================================

  const ajouterEleve = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage('');
    setErreur('');
    setAjoutEnCours(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setErreur(
          'Votre session a expiré. Veuillez vous reconnecter.'
        );
        return;
      }

      const res = await fetch(
        `${API_URL}/api/admin/eleves`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formulaire),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErreur(
          data.message ||
            'Impossible de créer l’élève.'
        );
        return;
      }

      setFormulaire({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        classe: '',
        date_naissance: '',
      });

      setAfficherFormulaire(false);

      setMessage(
        'Élève ajouté avec succès.'
      );

      // Relire les données directement depuis PostgreSQL
      await recupererEleves();

    } catch (error) {
      console.error(
        'Erreur ajout élève :',
        error
      );

      setErreur(
        'Impossible de contacter le serveur.'
      );

    } finally {
      setAjoutEnCours(false);
    }
  };

  // ================================
  // OUVRIR MODIFICATION
  // ================================

  const ouvrirModification = (
    eleve: Eleve
  ) => {
    setMessage('');
    setErreur('');

    setEleveEnModification(eleve);

    setFormulaireModification({
      prenom: eleve.prenom,
      nom: eleve.nom,
      email: eleve.email,
      password: '',
      classe: eleve.classe || '',
      date_naissance: eleve.date_naissance
        ? eleve.date_naissance.substring(0, 10)
        : '',
    });
  };

  // ================================
  // MODIFIER UN ÉLÈVE
  // ================================

  const modifierEleve = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!eleveEnModification) {
      return;
    }

    setMessage('');
    setErreur('');
    setModificationEnCours(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setErreur(
          'Votre session a expiré. Veuillez vous reconnecter.'
        );
        return;
      }

      console.log(
        'Modification de l’élève ID :',
        eleveEnModification.id
      );

      console.log(
        'Données envoyées :',
        formulaireModification
      );

      const res = await fetch(
        `${API_URL}/api/admin/eleves/${eleveEnModification.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            prenom: formulaireModification.prenom,
            nom: formulaireModification.nom,
            email: formulaireModification.email,
            classe: formulaireModification.classe,
            date_naissance:
              formulaireModification.date_naissance ||
              null,
            password:
              formulaireModification.password,
          }),
        }
      );

      const data = await res.json();

      console.log(
        'Réponse du serveur :',
        data
      );

      if (!res.ok) {
        setErreur(
          data.message ||
            'Impossible de modifier l’élève.'
        );
        return;
      }

      /*
       * IMPORTANT :
       * On ne modifie plus directement le tableau React.
       *
       * On demande au serveur de relire les données
       * depuis PostgreSQL.
       */
      await recupererEleves();

      setEleveEnModification(null);

      setMessage(
        'Élève modifié et enregistré dans la base de données.'
      );

    } catch (error) {
      console.error(
        'Erreur modification élève :',
        error
      );

      setErreur(
        'Impossible de contacter le serveur.'
      );

    } finally {
      setModificationEnCours(false);
    }
  };

  // ================================
  // SUPPRIMER UN ÉLÈVE
  // ================================

  const supprimerEleve = async (
    eleve: Eleve
  ) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer l'élève ${eleve.prenom} ${eleve.nom} ?`
    );

    if (!confirmation) {
      return;
    }

    setMessage('');
    setErreur('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setErreur(
          'Votre session a expiré. Veuillez vous reconnecter.'
        );
        return;
      }

      const res = await fetch(
        `${API_URL}/api/admin/eleves/${eleve.id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErreur(
          data.message ||
            'Impossible de supprimer l’élève.'
        );
        return;
      }

      setMessage(
        'Élève supprimé avec succès.'
      );

      await recupererEleves();

    } catch (error) {
      console.error(
        'Erreur suppression élève :',
        error
      );

      setErreur(
        'Impossible de contacter le serveur.'
      );
    }
  };

  // ================================
  // FERMER MODIFICATION
  // ================================

  const fermerModification = () => {
    setEleveEnModification(null);
  };

  // ================================
  // AFFICHAGE
  // ================================

  return (
    <div className="admin-eleves">

      <header className="admin-eleves-header">

        <div>
          <h1>Gestion des élèves</h1>

          <p>
            Liste des élèves inscrits dans
            l'établissement.
          </p>
        </div>

        <div className="admin-eleves-header-buttons">

          <button
            onClick={() => {
              setAfficherFormulaire(
                !afficherFormulaire
              );

              setMessage('');
              setErreur('');
            }}
          >
            {afficherFormulaire
              ? '✕ Fermer'
              : '➕ Ajouter un élève'}
          </button>

          <button
            onClick={() => navigate('/admin')}
          >
            ← Retour
          </button>

        </div>

      </header>

      <main className="admin-eleves-content">

        {/* FORMULAIRE AJOUT */}

        {afficherFormulaire && (

          <form
            className="form-ajout-eleve"
            onSubmit={ajouterEleve}
          >

            <h2>
              Ajouter un élève
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Prénom</label>

                <input
                  type="text"
                  placeholder="Prénom"
                  value={formulaire.prenom}
                  onChange={(e) =>
                    setFormulaire({
                      ...formulaire,
                      prenom:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom</label>

                <input
                  type="text"
                  placeholder="Nom"
                  value={formulaire.nom}
                  onChange={(e) =>
                    setFormulaire({
                      ...formulaire,
                      nom:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Adresse email"
                  value={formulaire.email}
                  onChange={(e) =>
                    setFormulaire({
                      ...formulaire,
                      email:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>

                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={formulaire.password}
                  onChange={(e) =>
                    setFormulaire({
                      ...formulaire,
                      password:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Classe</label>

                <input
                  type="text"
                  placeholder="Exemple : 3ème"
                  value={formulaire.classe}
                  onChange={(e) =>
                    setFormulaire({
                      ...formulaire,
                      classe:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Date de naissance</label>

                <input
                  type="date"
                  value={
                    formulaire.date_naissance
                  }
                  onChange={(e) =>
                    setFormulaire({
                      ...formulaire,
                      date_naissance:
                        e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                disabled={ajoutEnCours}
              >
                {ajoutEnCours
                  ? 'Ajout en cours...'
                  : 'Créer l’élève'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setAfficherFormulaire(false)
                }
              >
                Annuler
              </button>

            </div>

          </form>
        )}

        {/* FORMULAIRE MODIFICATION */}

        {eleveEnModification && (

          <form
            className="form-ajout-eleve"
            onSubmit={modifierEleve}
          >

            <h2>
              ✏️ Modifier l’élève
            </h2>

            <p>
              Modification de{' '}
              <strong>
                {eleveEnModification.prenom}{' '}
                {eleveEnModification.nom}
              </strong>
            </p>

            <div className="form-grid">

              <div className="form-group">
                <label>Prénom</label>

                <input
                  type="text"
                  value={
                    formulaireModification.prenom
                  }
                  onChange={(e) =>
                    setFormulaireModification({
                      ...formulaireModification,
                      prenom:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom</label>

                <input
                  type="text"
                  value={
                    formulaireModification.nom
                  }
                  onChange={(e) =>
                    setFormulaireModification({
                      ...formulaireModification,
                      nom:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={
                    formulaireModification.email
                  }
                  onChange={(e) =>
                    setFormulaireModification({
                      ...formulaireModification,
                      email:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Nouveau mot de passe
                </label>

                <input
                  type="password"
                  placeholder="Laisser vide pour conserver"
                  value={
                    formulaireModification.password
                  }
                  onChange={(e) =>
                    setFormulaireModification({
                      ...formulaireModification,
                      password:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Classe</label>

                <input
                  type="text"
                  value={
                    formulaireModification.classe
                  }
                  onChange={(e) =>
                    setFormulaireModification({
                      ...formulaireModification,
                      classe:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Date de naissance</label>

                <input
                  type="date"
                  value={
                    formulaireModification.date_naissance
                  }
                  onChange={(e) =>
                    setFormulaireModification({
                      ...formulaireModification,
                      date_naissance:
                        e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                disabled={modificationEnCours}
              >
                {modificationEnCours
                  ? 'Modification...'
                  : 'Enregistrer les modifications'}
              </button>

              <button
                type="button"
                onClick={fermerModification}
              >
                Annuler
              </button>

            </div>

          </form>
        )}

        {/* MESSAGE SUCCÈS */}

        {message && (
          <div className="message-succes">
            {message}
          </div>
        )}

        {/* MESSAGE ERREUR */}

        {erreur && (
          <div className="message-erreur">
            {erreur}
          </div>
        )}

        {/* CHARGEMENT */}

        {chargement && (
          <p>
            Chargement des élèves...
          </p>
        )}

        {/* LISTE */}

        {!chargement && !erreur && (

          <>

            <div className="eleves-resume">

              <strong>
                {eleves.length}
              </strong>

              <span>
                élève(s) inscrit(s)
              </span>

            </div>

            {eleves.length === 0 ? (

              <div className="aucun-eleve">
                Aucun élève n'est actuellement
                enregistré.
              </div>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Classe</th>
                      <th>Email</th>
                      <th>Date de naissance</th>
                      <th>Actions</th>
                    </tr>

                  </thead>

                  <tbody>

                    {eleves.map((eleve) => (

                      <tr key={eleve.id}>

                        <td>
                          {eleve.id}
                        </td>

                        <td>
                          {eleve.nom}
                        </td>

                        <td>
                          {eleve.prenom}
                        </td>

                        <td>
                          {eleve.classe ||
                            'Non définie'}
                        </td>

                        <td>
                          {eleve.email}
                        </td>

                        <td>
                          {eleve.date_naissance
                            ? new Date(
                                eleve.date_naissance
                              ).toLocaleDateString(
                                'fr-FR'
                              )
                            : 'Non renseignée'}
                        </td>

                        <td>

                          <div className="actions-eleve">

                            <button
                              type="button"
                              onClick={() =>
                                ouvrirModification(
                                  eleve
                                )
                              }
                            >
                              ✏️ Modifier
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                supprimerEleve(
                                  eleve
                                )
                              }
                            >
                              🗑️ Supprimer
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </>

        )}

      </main>

    </div>
  );
}
