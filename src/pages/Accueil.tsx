import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stats from '../components/stats';
import Carousel from '../components/Carousel';

import photo1 from '../assets/ecole.jpg';
import photo2 from '../assets/bat_prim.jpg';
import photo3 from '../assets/sortie_coll.jpg';

const API_URL = import.meta.env.VITE_API_URL;

const IMAGES_ACCUEIL = [
    { src: photo1, alt: 'Élèves en classe' },
    { src: photo2, alt: 'Cour de récréation' },
    { src: photo3, alt: 'Activité pédagogique' },
];

type AnneeScolaire = {
    id: number;
    libelle: string;
    active: boolean;
    created_at: string;
};

type StatistiquesEcole = {
    id: number;
    primaire_eleves: number;
    primaire_max_classe: number;
    primaire_niveaux: number;
    primaire_reussite_cep: string | number;
    college_eleves: number;
    college_max_classe: number;
    college_niveaux: number;
    college_reussite_bepc: string | number;
    updated_at: string;
};

export default function Accueil() {
    const navigate = useNavigate();

    const [anneeScolaire, setAnneeScolaire] = useState('');
    const [statistiques, setStatistiques] =
        useState<StatistiquesEcole | null>(null);

    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        const chargerDonnees = async () => {
            try {
                // ================================
                // RÉCUPÉRATION DE L'ANNÉE SCOLAIRE
                // ================================

                                const responseAnnee = await fetch(
                    `${API_URL}/api/annees-scolaires`
                );

                if (!responseAnnee.ok) {
                    throw new Error(
                        'Impossible de récupérer les années scolaires.'
                    );
                }

                const annees: AnneeScolaire[] =
                    await responseAnnee.json();

                const anneeActive = annees.find(
                    (annee) => annee.active
                );

                if (anneeActive) {
                    setAnneeScolaire(anneeActive.libelle);
                }

                // ================================
                // RÉCUPÉRATION DES STATISTIQUES
                // ================================

                const responseStatistiques = await fetch(
                    `${API_URL}/api/statistiques`
                );

                if (!responseStatistiques.ok) {
                    throw new Error(
                        'Impossible de récupérer les statistiques.'
                    );
                }

                const data: StatistiquesEcole =
                    await responseStatistiques.json();

                setStatistiques(data);

            } catch (error) {
                console.error(
                    'Erreur récupération données accueil :',
                    error
                );
            } finally {
                setChargement(false);
            }
        };

        chargerDonnees();
    }, []);

    // ================================
    // AFFICHAGE DU CHARGEMENT
    // ================================

    if (chargement) {
        return (
            <div className="accueil">
                <p>Chargement des informations...</p>
            </div>
        );
    }

    // ================================
    // VÉRIFICATION DES DONNÉES
    // ================================

    if (!statistiques) {
        return (
            <div className="accueil">
                <p>
                    Impossible de charger les informations de l'école.
                </p>
            </div>
        );
    }

    // ================================
    // STATISTIQUES PRIMAIRE
    // ================================

    const chiffresPrimaire = [
        {
            valeur: String(statistiques.primaire_eleves),
            label: 'élèves au primaire',
        },
        {
            valeur: String(statistiques.primaire_max_classe),
            label: 'élèves par classe max',
        },
        {
            valeur: String(statistiques.primaire_niveaux),
            label: 'niveaux, du CP1 au CM2',
        },
        {
            valeur: `${String(
                statistiques.primaire_reussite_cep
            ).replace('.', ',')}%`,
            label: 'de réussite au CEP',
        },
    ];

    // ================================
    // STATISTIQUES COLLÈGE
    // ================================

    const chiffresCollege = [
        {
            valeur: String(statistiques.college_eleves),
            label: 'élèves au collège',
        },
        {
            valeur: String(statistiques.college_max_classe),
            label: 'élèves par classe max',
        },
        {
            valeur: String(statistiques.college_niveaux),
            label: 'niveaux, de la 6e à la 3e',
        },
        {
            valeur: `${String(
                statistiques.college_reussite_bepc
            ).replace('.', ',')}%`,
            label: 'de réussite au BEPC',
        },
    ];

    return (
        <div className="accueil">

            {/* ================================
                CAROUSEL
            ================================= */}

            <Carousel
                images={IMAGES_ACCUEIL}
                overlay={
                    <>
                        <span className="carousel-annee">
                            Rentrée Scolaire {anneeScolaire}
                        </span>

                        <span className="carousel-inscription">
                            Inscriptions en cours ...
                        </span>
                    </>
                }
            />

            {/* ================================
                BOUTONS
            ================================= */}

            <div className="buton">
                <button
                    onClick={() => navigate('/contacter')}
                >
                    Prendre un rendez-vous
                </button>

                <button
                    onClick={() => navigate('/formations')}
                >
                    Découvrir nos formations
                </button>
            </div>

            {/* ================================
                STATISTIQUES PRIMAIRE
            ================================= */}

            <Stats
                titre="Ecole Primaire Privée Evangélique Guetawendé Ariel"
                chiffres={chiffresPrimaire}
            />

            {/* ================================
                STATISTIQUES COLLÈGE
            ================================= */}

            <Stats
                titre="Collège Privé Evangélique Ariel"
                chiffres={chiffresCollege}
            />

        </div>
    );
}
