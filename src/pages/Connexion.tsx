import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../Css/Connexion.css';

const API_URL = 'http://localhost:5000';

export default function Connexion() {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');

    const handleConnexion = async (e: React.FormEvent) => {
        e.preventDefault();
        setErreur('');
        setChargement(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: motDePasse }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErreur(data.message || 'Email ou mot de passe incorrect.');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

           if (data.user.role === 'admin') {
    navigate('/admin');
} else {
    navigate('/tableau-de-bord');
}
        } catch {
            setErreur('Impossible de contacter le serveur. Vérifie qu\'il est bien lancé.');
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="connexion">
            <div className="connexion-box">

                <h1>
                    {typeParam === 'parent' ? 'Connexion parent' : 'Connexion élève'}
                </h1>

                <p>Accédez à votre espace scolaire</p>

                <form onSubmit={handleConnexion}>
                    <label>Email</label>
                    <input 
                        type="email" 
                        placeholder="Votre adresse email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />

                    <label>Mot de passe</label>
                    <input 
                        type="password" 
                        placeholder="Votre mot de passe" 
                        value={motDePasse} 
                        onChange={(e) => setMotDePasse(e.target.value)} 
                        required 
                    />

                    {erreur && <p className="erreur-connexion">{erreur}</p>}

                    <button type="submit" disabled={chargement}>
                        {chargement ? 'Un instant...' : 'Se connecter'}
                    </button>

                    <p className="inscription-link">
                        Vous n'avez pas encore de compte ?{' '}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    typeParam
                                        ? `/inscription?type=${typeParam}`
                                        : '/inscription?type=eleve'
                                )
                            }
                        >
                            S'inscrire
                        </button>
                    </p>
                </form>

            </div>
        </div>
    );
}