import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AdminBulletin.css';

const API_URL = 'http://localhost:5000';

interface Eleve {
    id: number;
    nom: string;
    prenom: string;
    classe: string;
}

export default function AdminBulletin() {
    const navigate = useNavigate();

    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [eleveId, setEleveId] = useState('');
    const [periode, setPeriode] = useState('Trimestre 1');
    const [titre, setTitre] = useState('');
    const [fichierPdf, setFichierPdf] = useState<File | null>(null);

    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);
    const [chargementEleves, setChargementEleves] = useState(true);

    /*
     * ==========================================
     * RÉCUPÉRER LES ÉLÈVES
     * ==========================================
     */

    useEffect(() => {
        const chargerEleves = async () => {
            try {
                const token = localStorage.getItem('token');

                const res = await fetch(
                    `${API_URL}/api/admin/eleves`,
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
                    return;
                }

                setEleves(data.eleves || []);

            } catch {
                setErreur(
                    'Impossible de contacter le serveur.'
                );
            } finally {
                setChargementEleves(false);
            }
        };

        chargerEleves();
    }, []);

    /*
     * ==========================================
     * PUBLICATION DU BULLETIN
     * ==========================================
     */

    const handlePublier = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setErreur('');
        setMessage('');

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

        if (
            fichierPdf.type !==
            'application/pdf'
        ) {
            setErreur(
                'Le fichier doit être au format PDF.'
            );
            return;
        }

        setChargement(true);

        try {
            const token =
                localStorage.getItem('token');

            /*
             * ======================================
             * ÉTAPE 1 : UPLOAD DU PDF
             * ======================================
             */

            const formData = new FormData();

            formData.append(
                'pdf',
                fichierPdf
            );

            const uploadRes = await fetch(
                `${API_URL}/api/upload/upload-pdf`,
                {
                    method: 'POST',
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const uploadData =
                await uploadRes.json();

            if (!uploadRes.ok) {
                setErreur(
                    uploadData.message ||
                    "Échec de l'envoi du fichier PDF."
                );
                return;
            }

            const { url } = uploadData;

            /*
             * ======================================
             * ÉTAPE 2 : ENREGISTRER LE BULLETIN
             * ======================================
             */

            const actualiteRes =
                await fetch(
                    `${API_URL}/api/actualites`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            type: 'bulletin',
                            titre: titre.trim(),
                            eleveId:
                                Number(eleveId),
                            periode,
                            fichierUrl: url,
                        }),
                    }
                );

            const data =
                await actualiteRes.json();

            if (!actualiteRes.ok) {
                setErreur(
                    data.message ||
                    'Impossible de publier le bulletin.'
                );
                return;
            }

            setMessage(
                'Bulletin publié avec succès.'
            );

            // Réinitialiser le formulaire
            setEleveId('');
            setPeriode('Trimestre 1');
            setTitre('');
            setFichierPdf(null);

            // Réinitialiser l'input fichier
            const fichierInput =
                document.getElementById(
                    'fichierPdf'
                ) as HTMLInputElement | null;

            if (fichierInput) {
                fichierInput.value = '';
            }

        } catch {
            setErreur(
                'Impossible de contacter le serveur.'
            );
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="admin-bulletin">

            <div className="admin-bulletin-box">

                {/* =========================
                    EN-TÊTE
                ========================== */}

                <div className="admin-bulletin-header">

                    <div>
                        <h1>
                            Publier un bulletin
                        </h1>

                        <p>
                            Envoyez le bulletin PDF
                            d'un élève.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin')
                        }
                    >
                        ← Retour
                    </button>

                </div>


                {/* =========================
                    FORMULAIRE
                ========================== */}

                <form
                    onSubmit={handlePublier}
                >

                    {/* Élève */}

                    <label htmlFor="eleve">
                        Élève
                    </label>

                    <select
                        id="eleve"
                        value={eleveId}
                        onChange={(e) =>
                            setEleveId(
                                e.target.value
                            )
                        }
                        required
                        disabled={
                            chargementEleves
                        }
                    >

                        <option value="">
                            {chargementEleves
                                ? 'Chargement des élèves...'
                                : '-- Sélectionner un élève --'}
                        </option>

                        {eleves.map((eleve) => (
                            <option
                                key={eleve.id}
                                value={eleve.id}
                            >
                                {eleve.prenom}{' '}
                                {eleve.nom}
                                {' — '}
                                {eleve.classe}
                            </option>
                        ))}

                    </select>


                    {/* Titre */}

                    <label htmlFor="titre">
                        Titre du bulletin
                    </label>

                    <input
                        id="titre"
                        type="text"
                        placeholder="Ex : Bulletin du 1er trimestre"
                        value={titre}
                        onChange={(e) =>
                            setTitre(
                                e.target.value
                            )
                        }
                        required
                    />


                    {/* Période */}

                    <label htmlFor="periode">
                        Période
                    </label>

                    <select
                        id="periode"
                        value={periode}
                        onChange={(e) =>
                            setPeriode(
                                e.target.value
                            )
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
                                e.target.files?.[0] ||
                                null
                            )
                        }
                        required
                    />

                    {fichierPdf && (
                        <p>
                            📄 {fichierPdf.name}
                        </p>
                    )}


                    {/* Messages */}

                    {erreur && (
                        <p className="erreur-admin">
                            {erreur}
                        </p>
                    )}

                    {message && (
                        <p className="succes-admin">
                            {message}
                        </p>
                    )}


                    {/* Bouton */}

                    <button
                        type="submit"
                        disabled={chargement}
                    >
                        {chargement
                            ? 'Publication en cours...'
                            : '📄 Publier le bulletin'}
                    </button>

                </form>

            </div>

        </div>
    );
}