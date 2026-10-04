import { useEffect, useState } from 'react';
import '../Css/Actualites.css';
import GaleriePhotos from '../components/GaleriePhotos';

const API_URL = import.meta.env.VITE_API_URL;

const photosSortieCollege = import.meta.glob(
    '../assets/actualites/sortie-college/*.{jpg,jpeg,png,webp}',
    { eager: true, query: '?url', import: 'default' }
);

const photosSortiePrimaire = import.meta.glob(
    '../assets/actualites/sortie-primaire/*.{jpg,jpeg,png,webp}',
    { eager: true, query: '?url', import: 'default' }
);

const photosVisiteCeleste = import.meta.glob(
    '../assets/actualites/visite-celeste/*.{jpg,jpeg,png,webp}',
    { eager: true, query: '?url', import: 'default' }
);

type ActualitePubliee = {
    id: number;
    titre: string;
    contenu: string | null;
    photos: string[] | null;
    categorie: 'annonce' | 'sortie' | 'visite';
    created_at: string;
    periode?: string | null;
};

/* =========================================================
   DATES DES ANCIENNES ACTUALITÉS FIXES
   ========================================================= */

const DATE_VISITE_CELESTE = new Date('2025-10-01');
const DATE_SORTIE_PRIMAIRE = new Date('2025-12-01');
const DATE_SORTIE_COLLEGE = new Date('2026-02-01');

export default function Actualites() {

    /* =====================================================
       PHOTOS DES ANCIENNES ACTUALITÉS
       ===================================================== */

    const imagesCollege =
        Object.values(photosSortieCollege) as string[];

    const imagesPrimaire =
        Object.values(photosSortiePrimaire) as string[];

    const imagesCeleste =
        Object.values(photosVisiteCeleste) as string[];

    /* =====================================================
       ACTUALITÉS CRÉÉES PAR L'ADMIN
       ===================================================== */

    const [publications, setPublications] =
        useState<ActualitePubliee[]>([]);

    const [chargement, setChargement] =
        useState(true);

    /* =====================================================
       CHARGER LES ACTUALITÉS PUBLIQUES
       ===================================================== */

    useEffect(() => {

        const chargerActualites = async () => {

            try {

                setChargement(true);

                const response = await fetch(
                    `${API_URL}/api/actualites`
                );

                if (!response.ok) {
                    throw new Error(
                        'Impossible de charger les actualités.'
                    );
                }

                const data = await response.json();

                /*
                 * IMPORTANT :
                 * Le backend renvoie directement un tableau.
                 *
                 * Exemple :
                 * [
                 *   { id: 1, titre: "..." }
                 * ]
                 *
                 * On ne doit donc PAS utiliser :
                 * data.actualites
                 */

                if (Array.isArray(data)) {
                    setPublications(data);
                } else if (
                    data &&
                    Array.isArray(data.actualites)
                ) {
                    /*
                     * Cette partie permet aussi de fonctionner
                     * si le backend est plus tard modifié pour
                     * renvoyer { actualites: [...] }.
                     */
                    setPublications(data.actualites);
                } else {
                    setPublications([]);
                }

            } catch (error) {

                console.error(
                    'Erreur chargement actualités :',
                    error
                );

                setPublications([]);

            } finally {

                setChargement(false);

            }
        };

        chargerActualites();

    }, []);

    /* =====================================================
       TYPE BLOC
       ===================================================== */

    type Bloc = {
        date: Date;
        contenu: React.ReactNode;
    };

    /* =====================================================
       ANCIENNES ACTUALITÉS FIXES
       ===================================================== */

    const blocsFixes: Bloc[] = [

        {
            date: DATE_SORTIE_COLLEGE,

            contenu: (

                <article
                    className="actualite-card sortie-college-card"
                >

                    <div className="actualite-content">

                        <span className="actualite-tag">
                            COLLÈGE
                        </span>

                        <h3>
                            Sortie du collège
                        </h3>

                        <p>
                            Découvrez en images les moments forts
                            de la sortie du collège de notre
                            établissement.
                        </p>

                    </div>

                    <GaleriePhotos
                        images={imagesCollege}
                        nomGalerie="Sortie du collège"
                        iconeVide="📸"
                    />

                    <div className="actualite-date">
                        📅 Année scolaire 2025 - 2026
                    </div>

                </article>

            ),
        },

        {
            date: DATE_SORTIE_PRIMAIRE,

            contenu: (

                <article
                    className="actualite-card sortie-primaire-card"
                >

                    <div className="actualite-content">

                        <span className="actualite-tag">
                            PRIMAIRE
                        </span>

                        <h3>
                            Sortie du primaire
                        </h3>

                        <p>
                            Les élèves du primaire ont participé
                            à une sortie dans une ambiance éducative,
                            conviviale et enrichissante.
                        </p>

                    </div>

                    <GaleriePhotos
                        images={imagesPrimaire}
                        nomGalerie="Sortie du primaire"
                        iconeVide="🎒"
                    />

                    <div className="actualite-date">
                        📅 Année scolaire 2025 - 2026
                    </div>

                </article>

            ),
        },

        {
            date: DATE_VISITE_CELESTE,

            contenu: (

                <article
                    className="actualite-card visite-celeste-card"
                >

                    <div className="actualite-content">

                        <span className="actualite-tag">
                            VISITE
                        </span>

                        <h3>
                            Visite du groupe Céleste
                        </h3>

                        <p>
                            Une visite enrichissante permettant
                            aux élèves de découvrir l'environnement
                            professionnel et d'élargir leurs
                            connaissances.
                        </p>

                    </div>

                    <GaleriePhotos
                        images={imagesCeleste}
                        nomGalerie="Visite du groupe Céleste"
                        iconeVide="🏢"
                    />

                    <div className="actualite-date">
                        📅 Année scolaire 2025 - 2026
                    </div>

                </article>

            ),
        },

    ];

    /* =====================================================
       ACTUALITÉS CRÉÉES DEPUIS L'ADMIN
       ===================================================== */

    const blocsDynamiques: Bloc[] =
        publications.map((pub) => {

            const datePublication =
                new Date(pub.created_at);

            const photos =
                (pub.photos || []).map(
                    (url) =>
                        url.startsWith('http')
                            ? url
                            : `${API_URL}${url}`
                );

            /*
             * SORTIE OU VISITE
             */

            if (
                pub.categorie === 'sortie' ||
                pub.categorie === 'visite'
            ) {

                return {

                    date: datePublication,

                    contenu: (

                        <article
                            className="actualite-card"
                            key={pub.id}
                        >

                            <div className="actualite-content">

                                <span className="actualite-tag">

                                    {pub.categorie === 'sortie'
                                        ? 'SORTIE'
                                        : 'VISITE'}

                                </span>

                                <h3>
                                    {pub.titre}
                                </h3>

                                {pub.contenu && (
                                    <p>
                                        {pub.contenu}
                                    </p>
                                )}

                            </div>

                            {photos.length > 0 && (

                                <GaleriePhotos
                                    images={photos}
                                    nomGalerie={pub.titre}
                                />

                            )}

                            {pub.periode && (

                                <div className="actualite-date">
                                    📅 {pub.periode}
                                </div>

                            )}

                            {!pub.periode && (

                                <div className="actualite-date">
                                    📅{' '}
                                    {datePublication.toLocaleDateString(
                                        'fr-FR',
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        }
                                    )}
                                </div>

                            )}

                        </article>

                    ),

                };

            }

            /*
             * ANNONCE
             */

            return {

                date: datePublication,

                contenu: (

                    <article
                        className="annonce-simple"
                        key={pub.id}
                    >

                        <span className="actualite-tag">
                            ANNONCE
                        </span>

                        <h3>
                            {pub.titre}
                        </h3>

                        {pub.contenu && (
                            <p>
                                {pub.contenu}
                            </p>
                        )}

                        {pub.periode && (

                            <div className="actualite-date">
                                📅 {pub.periode}
                            </div>

                        )}

                        {!pub.periode && (

                            <div className="actualite-date">
                                📅{' '}
                                {datePublication.toLocaleDateString(
                                    'fr-FR',
                                    {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    }
                                )}
                            </div>

                        )}

                    </article>

                ),

            };

        });

    /* =====================================================
       COMBINER LES ANCIENNES ET NOUVELLES ACTUALITÉS
       ===================================================== */

    const tousLesBlocs = [
        ...blocsFixes,
        ...blocsDynamiques,
    ].sort(
        (a, b) =>
            b.date.getTime() -
            a.date.getTime()
    );

    /* =====================================================
       AFFICHAGE
       ===================================================== */

    return (

        <div className="actualites-page">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="actualites-hero">

                <div>

                    <span>
                        VIE DE L'ÉCOLE
                    </span>

                    <h1>
                        Actualités
                    </h1>

                    <p>
                        Découvrez les activités, sorties et
                        événements qui rythment la vie de notre
                        établissement.
                    </p>

                </div>

            </section>

            {/* =================================================
                CONTENU
            ================================================= */}

            <section className="actualites-affiche">

                <div className="section-heading">

                    <h2>
                        Nos dernières activités
                    </h2>

                    <p>
                        Revivez les moments importants de notre
                        communauté scolaire.
                    </p>

                </div>

                {/* CHARGEMENT */}

                {chargement && (

                    <div className="aucune-actualite">
                        Chargement des actualités...
                    </div>

                )}

                {/* ACTUALITÉS */}

                {!chargement &&
                    tousLesBlocs.length > 0 && (

                        tousLesBlocs.map(
                            (bloc, index) => (

                                <div key={index}>
                                    {bloc.contenu}
                                </div>

                            )
                        )

                    )}

                {/* AUCUNE */}

                {!chargement &&
                    tousLesBlocs.length === 0 && (

                        <div className="aucune-actualite">
                            Aucune actualité disponible
                            pour le moment.
                        </div>

                    )}

            </section>

        </div>

    );
}
