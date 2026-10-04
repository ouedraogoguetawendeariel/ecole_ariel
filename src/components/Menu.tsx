import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../Css/Menu.css';
import { User, Menu as MenuIcon, X } from 'lucide-react';

export default function Menu() {
    const [ouvert, setOuvert] = useState(false);

    const lienActif = ({ isActive }: { isActive: boolean }) =>
        isActive ? 'activeLink' : undefined;

    return (
        <nav className="menu">

            {/* LOGO + NOM DE L'ÉCOLE */}
            <div className="brand">
                <NavLink to="/accueil" className="brand-logo">
                    <img
                        src={logo}
                        alt="Logo de l'école"
                    />
                </NavLink>

                <span>
                    Complexe Scolaire Evangélique
                    <br />
                    Guetawendé Ariel
                </span>
            </div>

            {/* BOUTON MENU MOBILE */}
            <button
                className={`menu-burger ${
                    ouvert ? 'burger-ouvert' : ''
                }`}
                onClick={() => setOuvert(!ouvert)}
                aria-label="Menu"
                aria-expanded={ouvert}
            >
                {ouvert ? (
                    <X size={26} />
                ) : (
                    <MenuIcon size={26} />
                )}
            </button>

            {/* NAVIGATION */}
            <ul
                className={
                    ouvert
                        ? 'menu-liste menu-liste-ouverte'
                        : 'menu-liste'
                }
            >
                <li>
                    <NavLink
                        to="/accueil"
                        className={lienActif}
                        onClick={() => setOuvert(false)}
                    >
                        Accueil
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/formations"
                        className={lienActif}
                        onClick={() => setOuvert(false)}
                    >
                        Formations
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/actualites"
                        className={lienActif}
                        onClick={() => setOuvert(false)}
                    >
                        Actualités
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/localisation"
                        className={lienActif}
                        onClick={() => setOuvert(false)}
                    >
                        Localisation
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/contacter"
                        className={lienActif}
                        onClick={() => setOuvert(false)}
                    >
                        Contacter
                    </NavLink>
                </li>

                <li className="menu-utilisateur">
                    <NavLink
                        to="/utilisateur"
                        className={lienActif}
                        onClick={() => setOuvert(false)}
                        aria-label="Espace utilisateur"
                    >
                        <User size={20} />
                    </NavLink>
                </li>
            </ul>

        </nav>
    );
}

