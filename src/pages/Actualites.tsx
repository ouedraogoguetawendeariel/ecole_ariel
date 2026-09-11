import { useState } from 'react';
import '../Css/Actualites.css';

/* =========================
   PHOTOS DES ÉVÉNEMENTS
========================= */

const photosSortieCollege = import.meta.glob(
    '../assets/actualites/sortie-college/*.{jpg,jpeg,png,webp}',
    {
        eager: true,
        query: '?url',
        import: 'default',
    }
);

const photosSortiePrimaire = import.meta.glob(
    '../assets/actualites/sortie-primaire/*.{jpg,jpeg,png,webp}',
    {
        eager: true,
        query: '?url',
        import: 'default',
    }
);

const photosVisiteCeleste = import.meta.glob(
    '../assets/actualites/visite-celeste/*.{jpg,jpeg,png,webp}',
    {
        eager: true,
        query: '?url',
        import: 'default',
    }
);

export default function Actualites() {

    const imagesCollege = Object.values(photosSortieCollege) as string[];
    const imagesPrimaire = Object.values(photosSortiePrimaire) as string[];
    const imagesCeleste = Object.values(photosVisiteCeleste) as string[];

    /* =========================
       PHOTOS ACTUELLES
    ========================= */

    const [photoCollege, setPhotoCollege] = useState(0);
    const [photoPrimaire, setPhotoPrimaire] = useState(0);
    const [photoCeleste, setPhotoCeleste] = useState(0);

    /* =========================
       PLEIN ÉCRAN
    ========================= */

    const [pleinEcran, setPleinEcran] = useState(false);

    const [galerieActive, setGalerieActive] = useState<
        'college' | 'primaire' | 'celeste' | null
    >(null);

    /* =========================
       NAVIGATION
    ========================= */

    const precedent = (
        galerie: 'college' | 'primaire' | 'celeste'
    ) => {

        if (galerie === 'college' && imagesCollege.length > 0) {
            setPhotoCollege((index) =>
                index === 0
                    ? imagesCollege.length - 1
                    : index - 1
            );
        }

        if (galerie === 'primaire' && imagesPrimaire.length > 0) {
            setPhotoPrimaire((index) =>
                index === 0
                    ? imagesPrimaire.length - 1
                    : index - 1
            );
        }

        if (galerie === 'celeste' && imagesCeleste.length > 0) {
            setPhotoCeleste((index) =>
                index === 0
                    ? imagesCeleste.length - 1
                    : index - 1
            );
        }
    };

    const suivante = (
        galerie: 'college' | 'primaire' | 'celeste'
    ) => {

        if (galerie === 'college' && imagesCollege.length > 0) {
            setPhotoCollege((index) =>
                index === imagesCollege.length - 1
                    ? 0
                    : index + 1
            );
        }

        if (galerie === 'primaire' && imagesPrimaire.length > 0) {
            setPhotoPrimaire((index) =>
                index === imagesPrimaire.length - 1
                    ? 0
                    : index + 1
            );
        }

        if (galerie === 'celeste' && imagesCeleste.length > 0) {
            setPhotoCeleste((index) =>
                index === imagesCeleste.length - 1
                    ? 0
                    : index + 1
            );
        }
    };

    /* =========================
       OUVRIR PLEIN ÉCRAN
    ========================= */

    const ouvrirPleinEcran = (
        galerie: 'college' | 'primaire' | 'celeste'
    ) => {
        setGalerieActive(galerie);
        setPleinEcran(true);
    };

    /* =========================
       IMAGE DU PLEIN ÉCRAN
    ========================= */

    let imagePleinEcran = '';

    let compteurPleinEcran = 0;
    let totalPleinEcran = 0;

    if (galerieActive === 'college') {
        imagePleinEcran = imagesCollege[photoCollege];
        compteurPleinEcran = photoCollege;
        totalPleinEcran = imagesCollege.length;
    }

    if (galerieActive === 'primaire') {
        imagePleinEcran = imagesPrimaire[photoPrimaire];
        compteurPleinEcran = photoPrimaire;
        totalPleinEcran = imagesPrimaire.length;
    }

    if (galerieActive === 'celeste') {
        imagePleinEcran = imagesCeleste[photoCeleste];
        compteurPleinEcran = photoCeleste;
        totalPleinEcran = imagesCeleste.length;
    }

    return (
        <div className="actualites-page">

            {/* =========================
                EN-TÊTE
            ========================= */}

            <section className="actualites-hero">

                <div>

                    <span>VIE DE L'ÉCOLE</span>

                    <h1>Actualités</h1>

                    <p>
                        Découvrez les activités, sorties et événements
                        qui rythment la vie de notre établissement.
                    </p>

                </div>

            </section>


            {/* =========================
                ACTUALITÉS
            ========================= */}

            <section className="actualites-section">

                <div className="section-heading">

                    <h2>Nos dernières activités</h2>

                    <p>
                        Revivez les moments importants de notre communauté scolaire.
                    </p>

                </div>


                {/* ==================================================
                    SORTIE DU COLLÈGE
                ================================================== */}

                <article className="actualite-card sortie-college-card">

                    <div className="actualite-content">

                        <span className="actualite-tag">
                            COLLÈGE
                        </span>

                        <h3>
                            Sortie du collège
                        </h3>

                        <p>
                            Découvrez en images les moments forts de la
                            sortie du collège de notre établissement.
                        </p>

                    </div>


                    {imagesCollege.length > 0 ? (

                        <div className="college-gallery">

                            <div className="photo-principale">

                                <img
                                    src={imagesCollege[photoCollege]}
                                    alt={`Sortie du collège - photo ${photoCollege + 1}`}
                                    className="photo-cliquable"
                                    onClick={() =>
                                        ouvrirPleinEcran('college')
                                    }
                                />

                                <button
                                    className="gallery-btn gallery-prev"
                                    onClick={() =>
                                        precedent('college')
                                    }
                                >
                                    ‹
                                </button>

                                <button
                                    className="gallery-btn gallery-next"
                                    onClick={() =>
                                        suivante('college')
                                    }
                                >
                                    ›
                                </button>

                                <div className="photo-compteur">
                                    {photoCollege + 1} / {imagesCollege.length}
                                </div>

                            </div>


                            <div className="photo-miniatures">

                                {imagesCollege.map((image, index) => (

                                    <button
                                        key={index}
                                        className={
                                            index === photoCollege
                                                ? 'miniature active'
                                                : 'miniature'
                                        }
                                        onClick={() =>
                                            setPhotoCollege(index)
                                        }
                                    >

                                        <img
                                            src={image}
                                            alt={`Miniature ${index + 1}`}
                                        />

                                    </button>

                                ))}

                            </div>

                        </div>

                    ) : (

                        <div className="aucune-photo">

                            📸

                            <p>
                                Les photos de cette sortie seront bientôt disponibles.
                            </p>

                        </div>

                    )}


                    <div className="actualite-date">
                        📅 Année scolaire 2026 - 2027
                    </div>

                </article>


                {/* ==================================================
                    SORTIE DU PRIMAIRE
                ================================================== */}

                <article className="actualite-card sortie-primaire-card">

                    <div className="actualite-content">

                        <span className="actualite-tag">
                            PRIMAIRE
                        </span>

                        <h3>
                            Sortie du primaire
                        </h3>

                        <p>
                            Les élèves du primaire ont participé à une
                            sortie dans une ambiance éducative,
                            conviviale et enrichissante.
                        </p>

                    </div>


                    {imagesPrimaire.length > 0 ? (

                        <div className="college-gallery">

                            <div className="photo-principale">

                                <img
                                    src={imagesPrimaire[photoPrimaire]}
                                    alt={`Sortie du primaire - photo ${photoPrimaire + 1}`}
                                    className="photo-cliquable"
                                    onClick={() =>
                                        ouvrirPleinEcran('primaire')
                                    }
                                />

                                <button
                                    className="gallery-btn gallery-prev"
                                    onClick={() =>
                                        precedent('primaire')
                                    }
                                >
                                    ‹
                                </button>

                                <button
                                    className="gallery-btn gallery-next"
                                    onClick={() =>
                                        suivante('primaire')
                                    }
                                >
                                    ›
                                </button>

                                <div className="photo-compteur">
                                    {photoPrimaire + 1} / {imagesPrimaire.length}
                                </div>

                            </div>


                            <div className="photo-miniatures">

                                {imagesPrimaire.map((image, index) => (

                                    <button
                                        key={index}
                                        className={
                                            index === photoPrimaire
                                                ? 'miniature active'
                                                : 'miniature'
                                        }
                                        onClick={() =>
                                            setPhotoPrimaire(index)
                                        }
                                    >

                                        <img
                                            src={image}
                                            alt={`Miniature ${index + 1}`}
                                        />

                                    </button>

                                ))}

                            </div>

                        </div>

                    ) : (

                        <div className="aucune-photo">

                            🎒

                            <p>
                                Les photos de la sortie du primaire seront bientôt disponibles.
                            </p>

                        </div>

                    )}


                    <div className="actualite-date">
                        📅 Année scolaire 2026 - 2027
                    </div>

                </article>


                {/* ==================================================
                    VISITE DU GROUPE CÉLESTE
                ================================================== */}

                <article className="actualite-card visite-celeste-card">

                    <div className="actualite-content">

                        <span className="actualite-tag">
                            VISITE
                        </span>

                        <h3>
                            Visite du groupe Céleste
                        </h3>

                        <p>
                            Une visite enrichissante permettant aux élèves
                            de découvrir l'environnement professionnel
                            et d'élargir leurs connaissances.
                        </p>

                    </div>


                    {imagesCeleste.length > 0 ? (

                        <div className="college-gallery">

                            <div className="photo-principale">

                                <img
                                    src={imagesCeleste[photoCeleste]}
                                    alt={`Visite du groupe Céleste - photo ${photoCeleste + 1}`}
                                    className="photo-cliquable"
                                    onClick={() =>
                                        ouvrirPleinEcran('celeste')
                                    }
                                />

                                <button
                                    className="gallery-btn gallery-prev"
                                    onClick={() =>
                                        precedent('celeste')
                                    }
                                >
                                    ‹
                                </button>

                                <button
                                    className="gallery-btn gallery-next"
                                    onClick={() =>
                                        suivante('celeste')
                                    }
                                >
                                    ›
                                </button>

                                <div className="photo-compteur">
                                    {photoCeleste + 1} / {imagesCeleste.length}
                                </div>

                            </div>


                            <div className="photo-miniatures">

                                {imagesCeleste.map((image, index) => (

                                    <button
                                        key={index}
                                        className={
                                            index === photoCeleste
                                                ? 'miniature active'
                                                : 'miniature'
                                        }
                                        onClick={() =>
                                            setPhotoCeleste(index)
                                        }
                                    >

                                        <img
                                            src={image}
                                            alt={`Miniature ${index + 1}`}
                                        />

                                    </button>

                                ))}

                            </div>

                        </div>

                    ) : (

                        <div className="aucune-photo">

                            🏢

                            <p>
                                Les photos de la visite du groupe Céleste seront bientôt disponibles.
                            </p>

                        </div>

                    )}


                    <div className="actualite-date">
                        📅 Année scolaire 2026 - 2027
                    </div>

                </article>

            </section>


            {/* ==================================================
                PLEIN ÉCRAN
            ================================================== */}

            {pleinEcran && imagePleinEcran && (

                <div
                    className="photo-lightbox"
                    onClick={() => setPleinEcran(false)}
                >

                    <button
                        className="lightbox-fermer"
                        onClick={() => setPleinEcran(false)}
                    >
                        ×
                    </button>


                    <button
                        className="lightbox-prev"
                        onClick={(e) => {
                            e.stopPropagation();

                            if (galerieActive) {
                                precedent(galerieActive);
                            }
                        }}
                    >
                        ‹
                    </button>


                    <img
                        src={imagePleinEcran}
                        alt="Photo en plein écran"
                        onClick={(e) => e.stopPropagation()}
                    />


                    <button
                        className="lightbox-next"
                        onClick={(e) => {
                            e.stopPropagation();

                            if (galerieActive) {
                                suivante(galerieActive);
                            }
                        }}
                    >
                        ›
                    </button>


                    <div className="lightbox-compteur">

                        {compteurPleinEcran + 1} / {totalPleinEcran}

                    </div>

                </div>

            )}

        </div>
    );
}