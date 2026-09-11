import '../Css/footer.css';
import ReseauxSociaux from '../components/ReseauxSociaux';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-col">
                <span className="footer-title">Complexe Scolaire Evangélique<br /> Guetawendé Ariel</span>
                <p>Le succès de demain se prépare aujourd'hui.</p>
            </div>

            <div className="footer-col">
                <span className="footer-title">Liens rapides</span>
                <ul>
                    <li><a href="/accueil">Accueil</a></li>
                    <li><a href="/formations">Formations</a></li>
                    <li><a href="/localisation">Localisation</a></li>
                    <li><a href="/contacter">Contacter</a></li>
                </ul>
            </div>

            <div className="footer-col">
                <span className="footer-title">Contact</span>
                <p>Ouagadougou, Burkina Faso</p>
                <p>+226 70 30 58 82</p>
                <p>contact@ecole-guetawende.bf</p>
            </div>
                                <div className="contact-bloc">
                        <div className="horaires-titre">
                            <span>Suivez-nous</span>
                        </div>
                        <ReseauxSociaux />
                    </div>
        </footer>
    );
}