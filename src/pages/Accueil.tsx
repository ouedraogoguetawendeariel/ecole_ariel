import { useNavigate } from 'react-router-dom';
import Stats from '../components/stats';
import Carousel from '../components/Carousel';

import photo1 from '../assets/bat_prim.jpg';
import photo2 from '../assets/coll.jpg';
import photo3 from '../assets/sortie_coll.jpg';


const IMAGES_ACCUEIL = [
    { src: photo1, alt: 'Élèves en classe' },
    { src: photo2, alt: 'Cour de récréation' },
    { src: photo3, alt: 'Activité pédagogique' },
];

const CHIFFRES_PRIMAIRE = [
    { valeur: "300", label: "élèves au primaire" },
    { valeur: "50", label: "élèves par classe max" },
    { valeur: "6", label: "niveaux, du CP1 au CM2" },
    { valeur: "97,82%", label: "de réussite au CEP 2026" },
];

const CHIFFRES_COLLEGE = [
    { valeur: "280", label: "élèves au collège" },
    { valeur: "70", label: "élèves par classe max" },
    { valeur: "4", label: "niveaux, de la 6e à la 3e" },
    { valeur: "62,5%", label: "de réussite au BEPC 2026" },
];

export default function Accueil() {
    const navigate = useNavigate();

    return (
        <div className="accueil">
            <Carousel
                images={IMAGES_ACCUEIL}
                overlay={
                    <>
                        <span className="carousel-annee">Rentrée Scolaire 2026-2027</span>
                        <span className="carousel-inscription">Inscriptions en cours ...</span>
                    </>
                }
            />

            <div className="buton">
                <button onClick={() => navigate('/contacter')}>Prendre un rendez-vous</button>
                <button onClick={() => navigate('/formations')}>Découvrir nos formations</button>
            </div>

            <Stats titre="Ecole Primaire Privée Evangélique Guetawendé Ariel" chiffres={CHIFFRES_PRIMAIRE} />
            <Stats titre="Collège Privé Evangélique Ariel" chiffres={CHIFFRES_COLLEGE} />
        </div>
    )
}