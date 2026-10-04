import { useEffect, useState } from 'react';
import '../Css/Formations.css';

const API_URL = import.meta.env.VITE_API_URL;

type AnneeScolaire = {
    id: number;
    libelle: string;
    active: boolean;
    premier_versement: string | null;
    deuxieme_versement: string | null;
    troisieme_versement: string | null;
};

export default function Formations() {
    const [details, setDetails] = useState<'primaire' | 'college' | null>(null);

    const [anneeScolaire, setAnneeScolaire] = useState<AnneeScolaire | null>(null);
    const [loadingAnnee, setLoadingAnnee] = useState(true);

    // ============================================================
    // RÉCUPÉRER L'ANNÉE SCOLAIRE ACTIVE
    // ============================================================

    useEffect(() => {
        const chargerAnneeActive = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/anneesScolaires/active`
                );

                if (!response.ok) {
                    throw new Error(
                        'Impossible de récupérer l’année scolaire active.'
                    );
                }

                const data = await response.json();

                setAnneeScolaire(data);
            } catch (error) {
                console.error(
                    'Erreur récupération année scolaire :',
                    error
                );
            } finally {
                setLoadingAnnee(false);
            }
        };

        chargerAnneeActive();
    }, []);

    // ============================================================
    // FORMATER UNE DATE
    // ============================================================

    const formaterDate = (date: string | null) => {
        if (!date) {
            return '--/--/----';
        }

        const dateObj = new Date(date);

        if (isNaN(dateObj.getTime())) {
            return '--/--/----';
        }

        return dateObj.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // ============================================================
    // ANNÉE À AFFICHER
    // ============================================================

    const libelleAnnee = anneeScolaire?.libelle
        ? anneeScolaire.libelle.replace('-', ' - ')
        : '2026 - 2027';

    return (
        <div className="formations-page">

            {/* =====================================================
                EN-TÊTE
            ====================================================== */}

            <section className="formations-hero">
                <div className="hero-content">

                    <span className="hero-badge">
                        {loadingAnnee
                            ? 'CHARGEMENT DE L’ANNÉE SCOLAIRE...'
                            : `ANNÉE SCOLAIRE ${libelleAnnee}`}
                    </span>

                    <h1>Nos formations</h1>

                    <p>
                        Découvrez nos parcours scolaires, nos frais de scolarité
                        et les modalités d'inscription.
                    </p>

                </div>
            </section>

            {/* =====================================================
                INTRODUCTION
            ====================================================== */}

            <section className="formations-intro">

                <h2>Nos établissements</h2>

                <p>
                    Le Complexe Scolaire Évangélique Guetawendé Ariel
                    propose un enseignement adapté aux différentes étapes
                    du parcours scolaire.
                </p>

            </section>

            {/* =====================================================
                CARTES DES ÉTABLISSEMENTS
            ====================================================== */}

            <section className="etablissements">

                {/* =================================================
                    PRIMAIRE
                ================================================== */}

                <article className="formation-card">

                    <div className="formation-icon">
                        🎒
                    </div>

                    <h2>
                        École primaire
                    </h2>

                    <p className="formation-description">
                        Un cadre d'apprentissage permettant aux élèves
                        d'acquérir les bases essentielles de leur parcours scolaire.
                    </p>

                    <div className="classes">
                        <span>CP1</span>
                        <span>CP2</span>
                        <span>CE1</span>
                        <span>CE2</span>
                        <span>CM1</span>
                        <span>CM2</span>
                    </div>

                    <div className="prix">

                        <small>
                            Frais de scolarité
                        </small>

                        <strong>
                            40 000 F CFA
                        </strong>

                    </div>

                    <button
                        onClick={() =>
                            setDetails(
                                details === 'primaire'
                                    ? null
                                    : 'primaire'
                            )
                        }
                    >
                        {details === 'primaire'
                            ? 'Masquer les détails'
                            : 'Voir les détails'}
                    </button>

                    {details === 'primaire' && (

                        <div className="details-formation">

                            <h3>
                                📚 Informations — École primaire
                            </h3>

                            <p>
                                <strong>Classes :</strong>{' '}
                                CP1, CP2, CE1, CE2, CM1 et CM2
                            </p>

                            <p>
                                <strong>Scolarité :</strong>{' '}
                                40 000 F CFA
                            </p>

                            <p>
                                <strong>1er versement :</strong>{' '}
                                25 000 F CFA
                            </p>

                            <p>
                                <strong>2ème versement :</strong>{' '}
                                10 000 F CFA
                            </p>

                            <p>
                                <strong>3ème versement :</strong>{' '}
                                5 000 F CFA
                            </p>

                            <p>
                                <strong>Conseil de l'école :</strong>{' '}
                                1 000 F CFA
                                (Obligatoire pour tous les élèves)
                            </p>

                        </div>

                    )}

                </article>

                {/* =================================================
                    COLLÈGE
                ================================================== */}

                <article className="formation-card">

                    <div className="formation-icon">
                        🎓
                    </div>

                    <h2>
                        Collège
                    </h2>

                    <p className="formation-description">
                        Un enseignement permettant aux élèves de poursuivre
                        leur formation et de préparer les étapes suivantes
                        de leur parcours scolaire.
                    </p>

                    <div className="classes">

                        <span>6ème</span>
                        <span>5ème</span>
                        <span>4ème</span>
                        <span>3ème</span>

                    </div>

                    <div className="prix">

                        <small>
                            Frais de scolarité
                        </small>

                        <strong>
                            60 000 F CFA
                        </strong>

                    </div>

                    <button
                        onClick={() =>
                            setDetails(
                                details === 'college'
                                    ? null
                                    : 'college'
                            )
                        }
                    >
                        {details === 'college'
                            ? 'Masquer les détails'
                            : 'Voir les détails'}
                    </button>

                    {details === 'college' && (

                        <div className="details-formation">

                            <h3>
                                🎓 Informations — Collège
                            </h3>

                            <p>
                                <strong>Classes :</strong>{' '}
                                6ème, 5ème, 4ème et 3ème
                            </p>

                            <p>
                                <strong>Scolarité :</strong>{' '}
                                60 000 F CFA
                            </p>

                            <p>
                                <strong>1er versement :</strong>{' '}
                                40 000 F CFA
                            </p>

                            <p>
                                <strong>2ème versement :</strong>{' '}
                                10 000 F CFA
                            </p>

                            <p>
                                <strong>3ème versement :</strong>{' '}
                                10 000 F CFA
                            </p>

                            <p>
                                <strong>Conseil de l'école :</strong>{' '}
                                1 000 F CFA
                                (Obligatoire pour tous les élèves)
                            </p>

                        </div>

                    )}

                </article>

            </section>

            {/* =====================================================
                MODALITÉS
            ====================================================== */}

            <section className="modalites">

                <div className="section-title">

                    <span>💰</span>

                    <div>

                        <h2>
                            Modalités de paiement
                        </h2>

                        <p>
                            Les frais sont répartis en plusieurs versements.
                        </p>

                    </div>

                </div>

                <div className="paiement-grid">

                    {/* PRIMAIRE */}

                    <div className="paiement-card">

                        <h3>
                            École primaire
                        </h3>

                        <p>
                            <strong>
                                40 000 F CFA
                            </strong>
                        </p>

                        <ul>

                            <li>
                                1er versement : 25 000 F
                            </li>

                            <li>
                                2ème versement : 10 000 F
                            </li>

                            <li>
                                3ème versement : 5 000 F
                            </li>

                        </ul>

                    </div>

                    {/* COLLÈGE */}

                    <div className="paiement-card">

                        <h3>
                            Collège
                        </h3>

                        <p>
                            <strong>
                                60 000 F CFA
                            </strong>
                        </p>

                        <ul>

                            <li>
                                1er versement : 40 000 F
                            </li>

                            <li>
                                2ème versement : 10 000 F
                            </li>

                            <li>
                                3ème versement : 10 000 F
                            </li>

                        </ul>

                    </div>

                </div>

            </section>

            {/* =====================================================
                ÉCHÉANCES
            ====================================================== */}

            <section className="echeances">

                <h2>
                    📅 Échéances des versements
                </h2>

                <div className="echeances-grid">

                    <div>

                        <strong>
                            1er versement
                        </strong>

                        <span>
                            {formaterDate(
                                anneeScolaire?.premier_versement ?? null
                            )}
                        </span>

                    </div>

                    <div>

                        <strong>
                            2ème versement
                        </strong>

                        <span>
                            {formaterDate(
                                anneeScolaire?.deuxieme_versement ?? null
                            )}
                        </span>

                    </div>

                    <div>

                        <strong>
                            3ème versement
                        </strong>

                        <span>
                            {formaterDate(
                                anneeScolaire?.troisieme_versement ?? null
                            )}
                        </span>

                    </div>

                </div>

            </section>

            {/* =====================================================
                FRAIS ANNEXES
            ====================================================== */}

            <section className="frais-annexes">

                <div className="section-title">

                    <span>👕</span>

                    <div>

                        <h2>
                            Frais annexes
                        </h2>

                        <p>
                            Éléments liés à la tenue et à l'inscription.
                        </p>

                    </div>

                </div>

                <div className="frais-table">

                    <div className="frais-row frais-header">

                        <span>
                            Élément
                        </span>

                        <span>
                            Montant
                        </span>

                    </div>

                    <div className="frais-row">

                        <span>
                            Sans couture (bas)
                        </span>

                        <strong>
                            1 500 F CFA
                        </strong>

                    </div>

                    <div className="frais-row">

                        <span>
                            Kokodonda
                        </span>

                        <strong>
                            2 500 F CFA
                        </strong>

                    </div>

                    <div className="frais-row">

                        <span>
                            Insigne
                        </span>

                        <strong>
                            500 F CFA
                        </strong>

                    </div>

                    <div className="frais-row">

                        <span>
                            T-shirt simple
                        </span>

                        <strong>
                            1 500 F CFA
                        </strong>

                    </div>

                    <div className="frais-row">

                        <span>
                            Lacoste
                        </span>

                        <strong>
                            2 500 F CFA
                        </strong>

                    </div>

                    <div className="frais-row">

                        <span>
                            Conseil de l'école
                        </span>

                        <strong>
                            1 000 F CFA
                        </strong>

                    </div>

                </div>

            </section>

            {/* =====================================================
                DOSSIER D'INSCRIPTION
            ====================================================== */}

            <section className="dossier">

                <div className="section-title">

                    <span>📄</span>

                    <div>

                        <h2>
                            Dossier d'inscription
                        </h2>

                        <p>
                            Pièces demandées pour l'inscription au collège.
                        </p>

                    </div>

                </div>

                <div className="dossier-content">

                    <div>

                        <h3>
                            Pièces à fournir
                        </h3>

                        <ul>

                            <li>
                                Une chemise cartonnée
                            </li>

                            <li>
                                6ème : chemise rouge
                            </li>

                            <li>
                                5ème : chemise jaune
                            </li>

                            <li>
                                Une demande manuscrite non timbrée
                            </li>

                            <li>
                                Une photocopie de l'extrait d'acte de naissance
                            </li>

                            <li>
                                Une photocopie légalisée de l'attestation
                                ou du diplôme du CEP pour la 6ème
                            </li>

                            <li>
                                Les bulletins de la classe précédente
                                pour les 5ème, 4ème et 3ème
                            </li>

                        </ul>

                    </div>

                    <div className="dossier-note">

                        <strong>
                            NB
                        </strong>

                        <p>
                            Les photocopies des bulletins ne sont pas recevables.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}
