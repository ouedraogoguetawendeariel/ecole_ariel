const ECOLE_LAT = 12.4457865;
const ECOLE_LNG = -1.5208765;
const ECOLE_ADRESSE = "École Privée Évangélique Guetawendé Ariel, Sakoula, Ouagadougou, Burkina Faso";


export default function Situation() {
    const mapsEmbedUrl = `https://www.google.com/maps?q=${ECOLE_LAT},${ECOLE_LNG}&hl=fr&z=16&output=embed`;
    const itineraireUrl = `https://www.google.com/maps/dir/?api=1&destination=${ECOLE_LAT},${ECOLE_LNG}`;

    return (
        <div className="localisation">
            <h1>Où nous trouver</h1>
            <p>{ECOLE_ADRESSE}</p>

            
               <a href={itineraireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="itineraire-btn"
            >
                Voir l'itinéraire depuis ma position
            </a>

            <div className="carte-wrapper">
                <iframe
                    title="Localisation de l'école"
                    src={mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"/>
            </div>
        </div>
    );
}