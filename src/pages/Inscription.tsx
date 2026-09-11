import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../Css/Inscription.css';

const API_URL = 'http://localhost:5000';

export default function Inscription() {
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const type = typeParam === 'parent' || typeParam === 'eleve' ? typeParam : 'eleve';

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [nomEnfant, setNomEnfant] = useState('');
    const [classe, setClasse] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [classeEnfant, setClasseEnfant] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);
    const [dateNaissanceEnfant, setDateNaissanceEnfant] = useState('');

    const navigate = useNavigate();

    const handleInscription = async (e: React.FormEvent) => {
        e.preventDefault();
        setErreur('');

        if (motDePasse !== confirmation) {
            setErreur('Les mots de passe ne correspondent pas.');
            return;
        }

        setChargement(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: type,
                    nom,
                    prenom,
                    email,
                    password: motDePasse,
                    classe: type === 'eleve' ? classe : null,
                    dateNaissance: type === 'eleve' ? dateNaissance : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErreur(data.message || 'Une erreur est survenue.');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (type === 'parent') {
                const associationRes = await fetch(`${API_URL}/api/children/link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${data.token}`,
                    },
                    body: JSON.stringify({
                        nomEnfant: nomEnfant,
                        classeEnfant: classeEnfant,
                        dateNaissanceEnfant: dateNaissanceEnfant,
                    }),
                });

                const associationData = await associationRes.json();

                if (!associationRes.ok) {
                    setErreur(
                        associationData.message ||
                        "Impossible d'associer l'enfant."
                    );
                    return;
                }
            }

            navigate('/tableau-de-bord');
        } catch {
            setErreur('Impossible de contacter le serveur. Vérifie qu\'il est bien lancé.');
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="inscription">
            <div className="inscription-box">

                <h1>Créer un compte ({type === 'parent' ? 'Parent' : 'Élève'})</h1>
                <p>Inscrivez-vous pour accéder à votre espace scolaire</p>

                <form onSubmit={handleInscription}>
                    <label>Nom</label>
                    <input type="text" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} required />

                    <label>Prénom</label>
                    <input type="text" placeholder="Votre prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

                    {type === 'parent' && (
                        <>
                            <label>Nom complet de l'enfant</label>
                            <input
                                type="text"
                                placeholder="Nom de votre enfant"
                                value={nomEnfant}
                                onChange={(e) => setNomEnfant(e.target.value)}
                                required
                            />

                            <label>Date de naissance de l'enfant</label>
                            <input
                                type="date"
                                value={dateNaissanceEnfant}
                                onChange={(e) => setDateNaissanceEnfant(e.target.value)}
                                required
                            />

                            <label>Classe de l'enfant</label>
                            <select
                                value={classeEnfant}
                                onChange={(e) => setClasseEnfant(e.target.value)}
                                required
                            >
                                <option value="">Sélectionnez la classe</option>
                                <option value="6e">6e</option>
                                <option value="5e">5e</option>
                                <option value="4e">4e</option>
                                <option value="3e">3e</option>
                                <option value="2nde">2nde</option>
                                <option value="1ère">1ère</option>
                                <option value="Terminale">Terminale</option>
                            </select>
                        </>
                    )}

                    {type === 'eleve' && (
                        <>
                            <label>Classe</label>
                            <select
                                value={classe}
                                onChange={(e) => setClasse(e.target.value)}
                                required
                            >
                                <option value="">Sélectionnez votre classe</option>
                                <option value="6e">6e</option>
                                <option value="5e">5e</option>
                                <option value="4e">4e</option>
                                <option value="3e">3e</option>
                                <option value="2nde">2nde</option>
                                <option value="1ère">1ère</option>
                                <option value="Terminale">Terminale</option>
                            </select>

                            <label>Date de naissance</label>
                            <input
                                type="date"
                                value={dateNaissance}
                                onChange={(e) => setDateNaissance(e.target.value)}
                                required 
                            />
                        </>
                    )}

                    <label>Email</label>
                    <input type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label>Mot de passe</label>
                    <input type="password" placeholder="Créer un mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />

                    <label>Confirmer le mot de passe</label>
                    <input type="password" placeholder="Confirmer le mot de passe" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required />

                    {erreur && <p className="erreur-inscription">{erreur}</p>}

                    <button type="submit" disabled={chargement}>
                        {chargement ? 'Un instant...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className="retour-connexion">
                    Vous avez déjà un compte ?
                    <br />
                    <button type="button" onClick={() => navigate(`/connexion?type=${type}`)}>
                        Se connecter
                    </button>
                </p>

            </div>
        </div>
    );
}