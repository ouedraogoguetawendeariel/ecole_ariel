type CreneauBase = {
    id: number;
    jour: string;
    heure_debut: string;
    heure_fin: string;
    matiere: string;
    salle?: string | null;
};

type EmploiDuTempsGridProps<T extends CreneauBase> = {
    creneaux: T[];
    onModifier?: (creneau: T) => void;
    onSupprimer?: (id: number) => void;
};

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function EmploiDuTempsGrid<T extends CreneauBase>({
    creneaux,
    onModifier,
    onSupprimer,
}: EmploiDuTempsGridProps<T>) {
    const parJour = (jour: string) =>
        creneaux
            .filter((c) => c.jour === jour)
            .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

    const modifiable = Boolean(onModifier || onSupprimer);

    return (
        <div className="edt-grille">
            {JOURS.map((jour) => (
                <div className="edt-colonne" key={jour}>
                    <div className="edt-jour-titre">{jour}</div>
                    {parJour(jour).length === 0 ? (
                        <div className="edt-vide">—</div>
                    ) : (
                        parJour(jour).map((c) => (
                            <div className="edt-creneau" key={c.id}>
                                <span className="edt-heure">
                                    {c.heure_debut.substring(0, 5)} – {c.heure_fin.substring(0, 5)}
                                </span>
                                <span className="edt-matiere">{c.matiere}</span>
                                {c.salle && <span className="edt-salle">{c.salle}</span>}

                                {modifiable && (
                                    <div className="edt-actions">
                                        {onModifier && (
                                            <button type="button" onClick={() => onModifier(c)}>✏️</button>
                                        )}
                                        {onSupprimer && (
                                            <button type="button" onClick={() => onSupprimer(c.id)}>🗑️</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
}
