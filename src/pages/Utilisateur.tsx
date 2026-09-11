import { useNavigate } from 'react-router-dom';

import { User, GraduationCap, Users } from 'lucide-react';
import '../Css/Utilisateur.css';


export default function Utilisateur() {
    const navigate = useNavigate();

    return (

        <div className="utilisateur">

            <div className="user-header">
                <User size={45} />
                <h1>Espace utilisateur</h1>
                <p>Connectez-vous à votre espace</p>
            </div>

            <div className="user-choice">

                <div className="user-card">
                    <GraduationCap size={50} />
                    <h2>Élève</h2>
                    <p>
                        Accédez à vos notes, votre emploi du temps
                        et vos informations scolaires.
                    </p>
                    <button onClick={() => navigate('/connexion?type=eleve')}>
    Connexion élève
</button>
                </div>

                <div className="user-card">
                    <Users size={50} />
                    <h2>Parent</h2>
                    <p>
                        Suivez la scolarité de votre enfant.
                    </p>
                   <button onClick={() => navigate('/connexion?type=parent')}>
    Connexion parent
</button>
                </div>

            </div>

        </div>
    );
}