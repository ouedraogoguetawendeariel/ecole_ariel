import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';

const EMAIL_ECOLE = "contact@ecole-guetawende.bf";

const HORAIRES = [
    { jour: 'Lundi', heures: '7h30 – 16h' },
    { jour: 'Mardi', heures: '7h30 – 16h' },
    { jour: 'Mercredi', heures: '7h30 – 16h' },
    { jour: 'Jeudi', heures: '7h30 – 16h' },
    { jour: 'Vendredi', heures: '7h30 – 16h' },
    { jour: 'Samedi', heures: '7h30 – 11h' },
];

export default function Contacter() {
    const [form, setForm] = useState({ nom: '', email: '', message: '' });
    const [envoye, setEnvoye] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nom || !form.email) return;

        const sujet = encodeURIComponent(`Message de ${form.nom} depuis le site`);
        const corps = encodeURIComponent(
            `Nom : ${form.nom}\nEmail : ${form.email}\n\nMessage :\n${form.message}`
        );

        window.location.href = `mailto:${EMAIL_ECOLE}?subject=${sujet}&body=${corps}`;
        setEnvoye(true);
    };

    return (
        <div className="contacter">
            <div className="contact-wrapper">

                <div className="contact-infos">
                    <h1>Nous contacter</h1>
                    <p>Une question sur les inscriptions ou les formations ? Écrivez-nous, nous revenons vers vous sous 48h.</p>

                    <div className="contact-bloc">
                        <div className="contact-ligne">
                            <MapPin size={18} />
                            <span>Ouagadougou, Burkina Faso</span>
                        </div>
                        <div className="contact-ligne">
                            <Phone size={18} />
                            <span>+226 70 30 58 82</span>
                        </div>
                        <div className="contact-ligne">
                            <Mail size={18} />
                            <span>{EMAIL_ECOLE}</span>
                        </div>
                        <div className="contact-ligne whatsapp-ligne">
    <MessageCircle size={18} />
    <a
        href="https://wa.me/22670305882"
        target="_blank"
        rel="noopener noreferrer"
    >
        Nous contacter sur WhatsApp
    </a>
</div>
                    </div>

                    <div className="contact-bloc">
                        <div className="horaires-titre">
                            <Clock size={18} />
                            <span>Horaires d'ouverture</span>
                        </div>
                        <div className="horaires-liste">
                            {HORAIRES.map((h) => (
                                <div className="horaires-ligne" key={h.jour}>
                                    <span>{h.jour}</span>
                                    <span>{h.heures}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="contact-form">
                    {envoye ? (
                        <div className="confirmation">
                            <p>Ta messagerie a dû s'ouvrir avec le message pré-rempli.</p>
                            <p>Il ne reste plus qu'à cliquer sur "Envoyer" dedans.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="nom">Nom</label>
                            <input id="nom" name="nom" value={form.nom} onChange={handleChange} placeholder="Votre nom" />

                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" />

                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Votre message" />

                            <button type="submit">
                                Envoyer <Send size={16} />
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}