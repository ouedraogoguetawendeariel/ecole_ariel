type Chiffre = { valeur: string; label: string };

export default function Stats ({ titre, chiffres }: { titre?: string; chiffres: Chiffre[] }) {
    return (
        <div className="chiffres-bloc">
            {titre && <h3>{titre}</h3>}
            <div className="chiffres-cles">
                {chiffres.map((c) => (
                    <div className="chiffre" key={c.label}>
                        <span className="chiffre-valeur">{c.valeur}</span>
                        <span className="chiffre-label">{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}