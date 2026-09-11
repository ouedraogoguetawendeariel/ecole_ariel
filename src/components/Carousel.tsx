import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
    images: { src: string; alt: string }[];
    intervalMs?: number;
    overlay?: React.ReactNode;
};

export default function Carousel({ images, intervalMs = 4000, overlay }: CarouselProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [images.length, intervalMs]);

    const suivant = () => setIndex((i) => (i + 1) % images.length);
    const precedent = () => setIndex((i) => (i - 1 + images.length) % images.length);

    if (images.length === 0) return null;

    return (
        <div className="carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
                {images.map((img) => (
                    <img key={img.src} src={img.src} alt={img.alt} className="carousel-image" />
                ))}
            </div>

            {overlay && <div className="carousel-overlay">{overlay}</div>}

            <button className="carousel-fleche carousel-fleche-gauche" onClick={precedent} aria-label="Image précédente">
                <ChevronLeft size={22} />
            </button>
            <button className="carousel-fleche carousel-fleche-droite" onClick={suivant} aria-label="Image suivante">
                <ChevronRight size={22} />
            </button>

            <div className="carousel-dots">
                {images.map((img, i) => (
                    <button
                        key={img.src}
                        className={i === index ? 'carousel-dot carousel-dot-active' : 'carousel-dot'}
                        onClick={() => setIndex(i)}
                        aria-label={`Aller à l'image ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}