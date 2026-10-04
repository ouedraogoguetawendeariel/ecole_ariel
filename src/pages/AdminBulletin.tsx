import { useEffect, useState } from 'react';
import '../Css/AdminBulletin.css';
import '../Css/AdminTheme.css';
import AdminHeader from '../components/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL;

interface AnneeScolaire {
    id: number;
    libelle: string;
    active: boolean;
}

interface Eleve {
    id: number;
    nom: string;
    prenom: string;
    classe: string;
}

export default function AdminBulletin() {
    const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);

    const [anneeScolaireId, setAnneeScolaireId] = useState('');
    const [classe, setClasse] = useState('');
    const [eleveId, setEleveId] = useState('');
    const [periode, setPeriode] = useState('Trimestre 1');
    const [titre, setTitre] = useState('');
    const [fichierPdf, setFichierPdf] = useState<File | null>(null);

    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    const [chargement, setChargement] = useState(false);
    const [chargementInitial, setChargementInitial] = useState(true);
    const [chargementEleves, setChargementEleves] = useState(false);

    /*
     * Charger les années scolaires et les classes
     */
    useEffect(() => {
        const chargerOptions = async () => {
            try {
                const token = localStorage.getItem('token');

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [anneesRes, classesRes] = await Promise.all([
                    fetch(`${API_URL}/api/bulletins/options/annees`, {
                        headers,
                    }),
                    fetch(`${API_URL}/api/bulletins/options/classes`, {
                        headers,
                    }),
                ]);

                const anneesData = await anneesRes.json();
                const classesData = await classesRes.json();

                if (!anneesRes.ok) {
                    setErreur(
                        anneesData.message ||
                        'Impossible de récupérer les années scolaires.'
                    );
                    return;
                }

                if (!classesRes.ok) {
                    setErreur(
                        classesData.message ||
                        'Impossible de récupérer les classes.'
                    );
                    return;
                }

                setAnnees(anneesData.annees || []);
                setClasses(classesData.classes || []);

                /*
                 * Sélectionner automatiquement l'année active
                 */
                const anneeActive = (anneesData.annees || []).find(
                    (annee: AnneeScolaire) => annee.active
                );

                if (anneeActive) {
                    setAnneeScolaireId(String(anneeActive.id));
                } else if ((anneesData.annees || []).length > 0) {
                    setAnneeScolaireId(
                        String(anneesData.annees[0].id)
                    );
                }
            } catch (error) {
                console.error(error);
                setErreur(
                    'Impossible de contacter le serveur.'
                );
            } finally {
                setChargementInitial(false);
            }
        };

        chargerOptions();
    }, []);

    /*
     * Charger les élèves lorsque la classe change
     */
    useEffect(() => {
        const chargerEleves = async () => {
            if (!classe) {
                setEleves([]);
                setEleveId('');
                return;
            }

            setChargementEleves(true);
            setErreur('');

            try {
                const token = localStorage.getItem('token');

                const res = await fetch(
                    `${API_URL}/api/bulletins/options/eleves?classe=${encodeURIComponent(classe)}`,
                    {
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
                    setEleves([]);
                    return;
                }

                setEleves(data.eleves || []);
                setEleveId('');
            } catch (error) {
                console.error(error);
                setErreur(
                    'Impossible de contacter le serveur.'
                );
                setEleves([]);
            } finally {
                setChargementEleves(false);
            }
        };

        chargerEleves();
    }, [classe]);

    /*
     * Publication du bulletin
     */
    const handlePublier = async (e: React.FormEvent) => {
        e.preventDefault();

        setErreur('');
        setMessage('');

        if (!anneeScolaireId) {
            setErreur(
                'Veuillez sélectionner une année scolaire.'
            );
            return;
        }

        if (!classe) {
            setErreur(
                'Veuillez sélectionner une classe.'
            );
            return;
        }

        if (!eleveId) {
            setErreur(
                'Veuillez sélectionner un élève.'
            );
            return;
        }

        if (!titre.trim()) {
            setErreur(
                'Veuillez saisir le titre du bulletin.'
            );
            return;
        }

        if (!periode) {
            setErreur(
                'Veuillez sélectionner une période.'
            );
            return;
        }

        if (!fichierPdf) {
            setErreur(
                'Veuillez sélectionner un fichier PDF.'
            );
            return;
        }

        if (fichierPdf.type !== 'application/pdf') {
            setErreur(
                'Le fichier doit être au format PDF.'
            );
            return;
        }

        setChargement(true);

        try {
            const token = localStorage.getItem('token');

            const formData = new FormData();

            formData.append(
                'anneeScolaireId',
                anneeScolaireId
            );

            formData.append(
                'classe',
                classe
            );

            formData.append(
                'eleveId',
                eleveId
            );

            formData.append(
                'periode',
                periode
            );

            formData.append(
                'titre',
                titre.trim()
            );

            formData.append(
                'pdf',
                fichierPdf
            );

            const res = await fetch(
                `${API_URL}/api/bulletins/publier`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setErreur(
                    data.message ||
                    'Impossible de publier le bulletin.'
                );
                return;
            }

            setMessage(
                'Bulletin publié avec succès.'
            );

            /*
             * Réinitialisation du formulaire
             */
            setEleveId('');
            setPeriode('Trimestre 1');
            setTitre('');
            setFichierPdf(null);

            const fichierInput =
                document.getElementById(
                    'fichierPdf'
                ) as HTMLInputElement | null;

            if (fichierInput) {
                fichierInput.value = '';
            }

        } catch (error) {
            console.error(error);

            setErreur(
                'Impossible de contacter le serveur.'
            );
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="admin-eleves">

            <AdminHeader
                titre="Publier un bulletin"
                sousTitre="Publiez le bulletin PDF d'un élève."
            />

            <main className="admin-eleves-content">

                <form
                    onSubmit={handlePublier}
                    className="admin-bulletin-box"
                >

                    {/* ANNÉE SCOLAIRE */}
                    <label htmlFor="anneeScolaire">
                        Année scolaire
                    </label>

                    <select
                        id="anneeScolaire"
                        value={anneeScolaireId}
                        onChange={(e) =>
                            setAnneeScolaireId(e.target.value)
                        }
                        required
                        disabled={chargementInitial}
                    >
                        <option value="">
                            {chargementInitial
                                ? 'Chargement...'
                                : '-- Sélectionner une année scolaire --'}
                        </option>

                        {annees.map((annee) => (
                            <option
                                key={annee.id}
                                value={annee.id}
                            >
                                {annee.libelle}
                                {annee.active
                                    ? ' — Année active'
                                    : ''}
                            </option>
                        ))}
                    </select>


                    {/* CLASSE */}
                    <label htmlFor="classe">
                        Classe
                    </label>

                    <select
                        id="classe"
                        value={classe}
                        onChange={(e) =>
                            setClasse(e.target.value)
                        }
                        required
                        disabled={chargementInitial}
                    >
                        <option value="">
                            -- Sélectionner une classe --
                        </option>

                        {classes.map((classeItem) => (
                            <option
                                key={classeItem}
                                value={classeItem}
                            >
                                {classeItem}
                            </option>
                        ))}
                    </select>


                    {/* ÉLÈVE */}
                    <label htmlFor="eleve">
                        Élève
                    </label>

                    <select
                        id="eleve"
                        value={eleveId}
                        onChange={(e) =>
                            setEleveId(e.target.value)
                        }
                        required
                        disabled={
                            !classe ||
                            chargementEleves
                        }
                    >
                        <option value="">
                            {!classe
                                ? '-- Sélectionnez d’abord une classe --'
                                : chargementEleves
                                    ? 'Chargement des élèves...'
                                    : '-- Sélectionner un élève --'}
                        </option>

                        {eleves.map((eleve) => (
                            <option
                                key={eleve.id}
                                value={eleve.id}
                            >
                                {eleve.prenom} {eleve.nom}
                            </option>
                        ))}
                    </select>


                    {/* TITRE */}
                    <label htmlFor="titre">
                        Titre du bulletin
                    </label>

                    <input
                        id="titre"
                        type="text"
                        placeholder="Ex : Bulletin du 1er trimestre"
                        value={titre}
                        onChange={(e) =>
                            setTitre(e.target.value)
                        }
                        required
                    />


                    {/* PÉRIODE */}
                    <label htmlFor="periode">
                        Période
                    </label>

                    <select
                        id="periode"
                        value={periode}
                        onChange={(e) =>
                            setPeriode(e.target.value)
                        }
                        required
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


                    {/* PDF */}
                    <label htmlFor="fichierPdf">
                        Fichier PDF
                    </label>

                    <input
                        id="fichierPdf"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                            setFichierPdf(
                                e.target.files?.[0] || null
                            )
                        }
                        required
                    />

                    {fichierPdf && (
                        <p>
                            📄 {fichierPdf.name}
                        </p>
                    )}


                    {/* MESSAGES */}
                    {erreur && (
                        <p className="message-erreur">
                            {erreur}
                        </p>
                    )}

                    {message && (
                        <p className="message-succes">
                            {message}
                        </p>
                    )}


                    {/* BOUTON */}
                    <button
                        type="submit"
                        disabled={chargement}
                    >
                        {chargement
                            ? 'Publication en cours...'
                            : '📄 Publier le bulletin'}
                    </button>

                </form>

            </main>

        </div>
    );
}

