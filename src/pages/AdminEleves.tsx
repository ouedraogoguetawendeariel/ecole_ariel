import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AdminEleves.css';

const API_URL = 'http://localhost:5000';

interface Eleve {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  classe: string;
  date_naissance: string | null;
}

export default function AdminEleves() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const recupererEleves = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/api/admin/eleves`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setErreur(data.message || 'Impossible de récupérer les élèves.');
          return;
        }

        setEleves(data.eleves);
      } catch {
        setErreur('Impossible de contacter le serveur.');
      } finally {
        setChargement(false);
      }
    };

    recupererEleves();
  }, []);

  return (
    <div className="admin-eleves">
      <header className="admin-eleves-header">
        <div>
          <h1>Gestion des élèves</h1>
          <p>Liste des élèves inscrits dans l'établissement.</p>
        </div>

        <button onClick={() => navigate('/admin')}>
          ← Retour
        </button>
      </header>

      <main className="admin-eleves-content">
        {chargement && <p>Chargement des élèves...</p>}

        {erreur && (
          <div className="message-erreur">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && (
          <>
            <div className="eleves-resume">
              <strong>{eleves.length}</strong>
              <span>élève(s) inscrit(s)</span>
            </div>

            {eleves.length === 0 ? (
              <div className="aucun-eleve">
                Aucun élève n'est actuellement enregistré.
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
                    </tr>
                  </thead>

                  <tbody>
                    {eleves.map((eleve) => (
                      <tr key={eleve.id}>
                        <td>{eleve.id}</td>
                        <td>{eleve.nom}</td>
                        <td>{eleve.prenom}</td>
                        <td>{eleve.classe || 'Non définie'}</td>
                        <td>{eleve.email}</td>
                        <td>
                          {eleve.date_naissance
                            ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR')
                            : 'Non renseignée'}
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