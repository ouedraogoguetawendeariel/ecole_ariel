import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/EmploiDuTemps.css';

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

interface User {
  id: number;
  role: 'eleve' | 'parent';
  nom: string;
  prenom?: string;
  email: string;
  classe?: string | null;
}

interface Enfant {
  id: number;
  prenom?: string;
  nom: string;
  email: string;
  classe: string;
  date_naissance: string;
}

const jours = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

export default function EmploiDuTemps() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [enfant, setEnfant] = useState<Enfant | null>(null);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [classe, setClasse] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const chargerEmploiDuTemps = async () => {
      if (!token) {
        setErreur('Utilisateur non connecté.');
        setChargement(false);
        return;
      }

      try {
        /*
         * Récupération de l'utilisateur enregistré
         * lors de la connexion.
         */
        const utilisateurEnregistre = localStorage.getItem('user');

        if (!utilisateurEnregistre) {
          setErreur('Informations de connexion introuvables.');
          setChargement(false);
          return;
        }

        const utilisateur: User = JSON.parse(
          utilisateurEnregistre
        );

        setUser(utilisateur);

        let classeUtilisateur = '';
        let enfantPourAffichage: Enfant | null = null;

        /*
         * =====================================================
         * CAS 1 : UTILISATEUR = ÉLÈVE
         * =====================================================
         */
        if (utilisateur.role === 'eleve') {
          if (!utilisateur.classe) {
            setErreur(
              'La classe de cet élève n’est pas renseignée.'
            );
            setChargement(false);
            return;
          }

          classeUtilisateur = utilisateur.classe;
        }

        /*
         * =====================================================
         * CAS 2 : UTILISATEUR = PARENT
         * =====================================================
         */
        if (utilisateur.role === 'parent') {
          const enfantsResponse = await fetch(
            `${API_URL}/api/children`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const enfantsData = await enfantsResponse.json();

          if (!enfantsResponse.ok) {
            throw new Error(
              enfantsData.message ||
                'Impossible de récupérer les enfants.'
            );
          }

          const enfants: Enfant[] =
            enfantsData.enfants || [];

          if (enfants.length === 0) {
            setErreur(
              'Aucun enfant n’est associé à ce compte parent.'
            );
            setChargement(false);
            return;
          }

          /*
           * Pour le moment, nous prenons automatiquement
           * le premier enfant associé au compte parent.
           */
          enfantPourAffichage = enfants[0];

          setEnfant(enfantPourAffichage);

          if (!enfantPourAffichage.classe) {
            setErreur(
              'La classe de votre enfant n’est pas renseignée.'
            );
            setChargement(false);
            return;
          }

          classeUtilisateur =
            enfantPourAffichage.classe;
        }

        /*
         * =====================================================
         * ENREGISTREMENT DE LA CLASSE
         * =====================================================
         */
        setClasse(classeUtilisateur);

        /*
         * =====================================================
         * CHARGEMENT DE L'EMPLOI DU TEMPS
         * =====================================================
         */
        const emploiResponse = await fetch(
          `${API_URL}/api/emploiDuTemps?classe=${encodeURIComponent(
            classeUtilisateur
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const emploiData = await emploiResponse.json();

        if (!emploiResponse.ok) {
          throw new Error(
            emploiData.message ||
              'Impossible de charger l’emploi du temps.'
          );
        }

        setCreneaux(emploiData.creneaux || []);
      } catch (error) {
        console.error(
          'Erreur emploi du temps :',
          error
        );

        setErreur(
          error instanceof Error
            ? error.message
            : 'Impossible de charger l’emploi du temps.'
        );
      } finally {
        setChargement(false);
      }
    };

    chargerEmploiDuTemps();
  }, [token]);

  const creneauxDuJour = (jour: string) => {
    return creneaux
      .filter((creneau) => creneau.jour === jour)
      .sort((a, b) =>
        a.heure_debut.localeCompare(
          b.heure_debut
        )
      );
  };

  return (
    <div className="emploi-utilisateur">

      {/* ================= HEADER ================= */}

      <header className="emploi-header">
        <div>
          <h1>📅 Mon emploi du temps</h1>

          <p>
            Consultez le programme de votre classe.
          </p>
        </div>

        <button
          className="emploi-retour"
          onClick={() =>
            navigate('/tableau-de-bord')
          }
        >
          ← Retour
        </button>
      </header>

      {/* ================= CONTENU ================= */}

      <main className="emploi-contenu">

        {/* ==========================================
            INFORMATIONS DE L'ÉLÈVE
        ========================================== */}

        {user?.role === 'eleve' && (
          <div className="emploi-utilisateur-info">

            <div>
              <strong>Élève :</strong>{' '}

              {user.prenom
                ? `${user.prenom} ${user.nom}`
                : user.nom}
            </div>

            <div>
              <strong>Classe :</strong>{' '}
              {classe}
            </div>

          </div>
        )}

        {/* ==========================================
            INFORMATIONS DE L'ENFANT POUR LE PARENT
        ========================================== */}

        {user?.role === 'parent' &&
          enfant && (
            <div className="emploi-utilisateur-info">

              <div>
                <strong>Élève :</strong>{' '}

                {enfant.prenom
                  ? `${enfant.prenom} ${enfant.nom}`
                  : enfant.nom}
              </div>

              <div>
                <strong>Classe :</strong>{' '}
                {classe}
              </div>

            </div>
          )}

        {/* ================= CHARGEMENT ================= */}

        {chargement && (
          <div className="emploi-message">
            Chargement de l’emploi du temps...
          </div>
        )}

        {/* ================= ERREUR ================= */}

        {erreur && (
          <div className="emploi-erreur">
            ⚠️ {erreur}
          </div>
        )}

        {/* ================= AUCUN COURS ================= */}

        {!chargement &&
          !erreur &&
          creneaux.length === 0 && (
            <div className="emploi-message">
              Aucun emploi du temps n’est disponible
              pour la classe {classe}.
            </div>
          )}

        {/* ================= EMPLOI DU TEMPS ================= */}

        {!chargement &&
          !erreur &&
          creneaux.length > 0 && (
            <>
              <h2>
                Emploi du temps — {classe}
              </h2>

              <div className="emploi-grille">

                {jours.map((jour) => {
                  const creneauxJour =
                    creneauxDuJour(jour);

                  return (
                    <div
                      className="emploi-jour"
                      key={jour}
                    >

                      <div className="emploi-jour-titre">
                        {jour}
                      </div>

                      <div className="emploi-jour-contenu">

                        {creneauxJour.length === 0 ? (
                          <p className="emploi-vide">
                            Aucun cours
                          </p>
                        ) : (
                          creneauxJour.map(
                            (creneau) => (
                              <div
                                className="emploi-cours"
                                key={creneau.id}
                              >

                                <div className="emploi-matiere">
                                  {creneau.matiere}
                                </div>

                                <div className="emploi-heure">
                                  🕐{' '}
                                  {creneau.heure_debut.substring(
                                    0,
                                    5
                                  )}{' '}
                                  -{' '}
                                  {creneau.heure_fin.substring(
                                    0,
                                    5
                                  )}
                                </div>

                                {creneau.salle && (
                                  <div className="emploi-salle">
                                    📍 Salle :{' '}
                                    {creneau.salle}
                                  </div>
                                )}

                              </div>
                            )
                          )
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

      </main>
    </div>
  );
}
