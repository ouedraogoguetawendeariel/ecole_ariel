import { useState } from 'react';

type GaleriePhotosProps = {
    images: string[];
    nomGalerie: string;
    iconeVide?: string;
    texteVide?: string;
};

export default function GaleriePhotos({
    images,
    nomGalerie,
    iconeVide = '📸',
    texteVide = 'Les photos seront bientôt disponibles.',
}: GaleriePhotosProps) {
    const [index, setIndex] = useState(0);
    const [pleinEcran, setPleinEcran] = useState(false);

    if (images.length === 0) {
        return (
            <div className="aucune-photo">
                {iconeVide}
                <p>{texteVide}</p>
            </div>
        );
    }

    const precedent = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const suivante = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    return (
        <>
            <div className="college-gallery">
                <div className="photo-principale">
                    <img
                        src={images[index]}
                        alt={`${nomGalerie} - photo ${index + 1}`}
                        className="photo-cliquable"
                        onClick={() => setPleinEcran(true)}
                    />
                    <button className="gallery-btn gallery-prev" onClick={precedent}>‹</button>
                    <button className="gallery-btn gallery-next" onClick={suivante}>›</button>
                    <div className="photo-compteur">{index + 1} / {images.length}</div>
                </div>

                <div className="photo-miniatures">
                    {images.map((image, i) => (
                        <button
                            key={i}
                            className={i === index ? 'miniature active' : 'miniature'}
                            onClick={() => setIndex(i)}
                        >
                            <img src={image} alt={`Miniature ${i + 1}`} />
                        </button>
                    ))}
                </div>
            </div>

            {pleinEcran && (
                <div className="photo-lightbox" onClick={() => setPleinEcran(false)}>
                    <button className="lightbox-fermer" onClick={() => setPleinEcran(false)}>×</button>
                    <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); precedent(); }}>‹</button>
                    <img src={images[index]} alt="Photo en plein écran" onClick={(e) => e.stopPropagation()} />
                    <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); suivante(); }}>›</button>
                    <div className="lightbox-compteur">{index + 1} / {images.length}</div>
                </div>
            )}
        </>
    );
}
