import { euros, percent, quoteMath, type QuoteLine } from "@/lib/ops.shared";

export const DESIGNED_EMAILS: Array<[string, string, string, string, string]> = [
  [
    "Email de vérification",
    "Compte",
    "Automatique",
    "Confirmez votre adresse email",
    "Bonjour {{client}},\n\nConfirmez votre adresse email pour activer votre compte Sourcing Pick.\n\nCe lien expire dans 30 minutes. Ne le partagez avec personne.",
  ],
  [
    "Bienvenue et didacticiel",
    "Compte",
    "Automatique",
    "Votre compte Sourcing Pick est prêt",
    "Bonjour {{client}},\n\nVotre compte est activé. Trois minutes de visite guidée, puis votre première demande.\n\nComplétez votre société et votre adresse de livraison, envoyez votre première demande, puis ajoutez vos fournisseurs.\n\nL’espace client web fait tout en attendant l’application.",
  ],
  [
    "Réinitialisation du mot de passe",
    "Compte",
    "À la demande",
    "Réinitialisez votre mot de passe Sourcing Pick",
    "Bonjour {{client}},\n\nNous avons reçu une demande de réinitialisation de votre mot de passe. Le lien expire dans 1 heure.\n\nVous n’êtes pas à l’origine de cette demande ? Ignorez cet email : votre mot de passe ne changera pas.",
  ],
  [
    "Code de vérification",
    "Compte",
    "À la demande",
    "{{code}} est votre code Sourcing Pick",
    "Bonjour {{client}},\n\nSaisissez ce code dans votre espace pour confirmer que c’est bien vous.\n\nCe code expire bientôt. Ne le communiquez à personne.",
  ],
  [
    "Invitation agent",
    "Équipe",
    "À la création du compte",
    "Votre accès agent Sourcing Pick",
    "Bonjour {{client}},\n\nUn administrateur a créé votre compte agent. Activez-le et choisissez votre mot de passe vous-même : nous n’envoyons jamais de mot de passe par email.",
  ],
  [
    "Nouvelle demande",
    "Demande",
    "À l’envoi client",
    "Nouvelle demande : {{produit}}",
    "Une demande attend votre réponse.\n\nProduit : {{produit}}\nClient : {{client}}\nRéférence : {{numero}}\n\nMerci de répondre sous 24 heures.",
  ],
  [
    "Devis reçu",
    "Devis",
    "À l’envoi du devis",
    "Votre devis est prêt : {{numero}}",
    "Bonjour {{client}},\n\nVotre devis {{numero}} est prêt. Il détaille la commande ligne par ligne : marchandises, prestations et fret s’ils sont facturés, commission, total, acompte et solde.\n\nMontant du devis : {{montant}}\nAcompte à la commande : {{acompte}}\nSolde avant expédition : {{solde}}\nValidité : {{validite}} jours\nLivraison : {{livraison}}\n\nPour le signer :\n\n1. Ouvrez le bouton « Consulter et signer le devis ».\n2. Indiquez l’adresse email qui a reçu ce message.\n3. Vous recevez un code, valable 15 minutes. Saisissez-le. Ce message ne contient pas le code.\n4. Indiquez votre nom, votre fonction et la société que vous engagez.\n5. Signez en dessinant, ou en écrivant votre nom.\n6. Validez. La date, l’adresse IP et ces informations sont jointes à la signature. Elle vaut acceptation du devis et des conditions générales de vente.\n7. La facture d’acompte vous est envoyée juste après.\n\nUne question avant de signer ? Répondez à cet email. Une copie est adressée à contact@sourcingpick.com.",
  ],
  [
    "Devis accepté",
    "Devis",
    "À la signature",
    "Devis accepté : {{numero}}",
    "{{client}} a accepté le devis {{numero}}.\n\nLa facture d’acompte part dans la foulée. Préparez la suite dès que le règlement est rapproché.",
  ],
  [
    "Devis refusé",
    "Devis",
    "Au refus",
    "Devis refusé : {{numero}}",
    "Le devis {{numero}} a été refusé.\n\nConsultez la conversation pour comprendre pourquoi et, si c’est pertinent, proposez un nouveau devis.",
  ],
  [
    "Relance de signature",
    "Devis",
    "48 h après l’envoi",
    "Votre devis attend une signature",
    "Bonjour {{client}},\n\nVotre devis {{numero}} attend toujours votre signature électronique. Signez-le pour passer au paiement de l’acompte et lancer la commande.",
  ],
  [
    "Facture d’acompte",
    "Paiement",
    "À la signature",
    "Acompte à régler : {{numero}}",
    "Bonjour {{client}},\n\nPour lancer la commande, il reste à régler l’acompte {{numero}}.\n\nPayez dans votre espace, ou utilisez le virement indiqué sur la facture.",
  ],
  [
    "Relance de paiement J-3",
    "Paiement",
    "Automatique",
    "Plus que 3 jours pour régler votre acompte",
    "Bonjour {{client}},\n\nIl reste 3 jours pour régler la facture {{numero}}. Une fois le paiement reçu, les opérations partent.",
  ],
  [
    "Relance de paiement J-1",
    "Paiement",
    "Automatique",
    "Plus qu’un jour pour régler votre acompte",
    "Bonjour {{client}},\n\nIl reste un jour pour régler la facture {{numero}}. Une fois le paiement reçu, les opérations partent.",
  ],
  [
    "Relance de paiement J0",
    "Paiement",
    "Automatique",
    "Dernier jour pour régler votre acompte",
    "Bonjour {{client}},\n\nC’est aujourd’hui le dernier jour pour régler la facture {{numero}}.",
  ],
  [
    "Commande confirmée",
    "Commande",
    "À l’encaissement",
    "Commande confirmée",
    "Bonjour {{client}},\n\nMerci. L’équipe prend en charge votre commande et vous tient informé à chaque étape.",
  ],
  [
    "Changement d’état",
    "Commande",
    "À chaque étape publique",
    "Votre commande a avancé",
    "Bonjour {{client}},\n\nVotre commande a changé d’étape. Ouvrez votre espace pour voir où elle en est.",
  ],
  [
    "Code pour signer le devis",
    "Devis",
    "Après vérification de l’email",
    "Code pour signer {{numero}}",
    "Bonjour {{client}},\n\nVoici le code pour ouvrir et signer le devis {{numero}}. Il est valable 15 minutes.\n\nSi vous n’êtes pas en train de signer, ignorez ce message.",
  ],
  [
    "Devis renvoyé",
    "Devis",
    "À chaque renvoi",
    "Votre devis {{numero}}, à nouveau",
    "Bonjour {{client}},\n\nNous vous renvoyons le devis {{numero}}. Ouvrez le lien, confirmez votre email, puis le code qui vous sera envoyé. Le document n’apparaît qu’après ce code.",
  ],
  [
    "Facture de solde",
    "Paiement",
    "À l’émission",
    "Solde à régler : {{numero}}",
    "Bonjour {{client}},\n\nLe solde {{numero}} est émis. Réglez-le pour lancer l’expédition.",
  ],
  [
    "Facture intégrale",
    "Paiement",
    "À l’émission",
    "Votre facture {{numero}}",
    "Bonjour {{client}},\n\nVotre facture {{numero}} est prête. Le détail est dans votre espace, avec le moyen de règlement.",
  ],
  [
    "Avoir émis",
    "Paiement",
    "À l’annulation",
    "Avoir {{numero}}",
    "Bonjour {{client}},\n\nUn avoir {{numero}} annule la facture d’origine. Le montant est déduit de votre compte. La facture annulée reste visible.",
  ],
  [
    "Relance J+7",
    "Paiement",
    "7 jours après l’échéance",
    "Rappel : facture {{numero}}",
    "Bonjour {{client}},\n\nLa facture {{numero}} est échue depuis 7 jours. Merci de la régler, ou de nous écrire si un paiement est déjà parti.",
  ],
  [
    "Relance J+15",
    "Paiement",
    "15 jours après l’échéance",
    "Relance : facture {{numero}}",
    "Bonjour {{client}},\n\nLa facture {{numero}} est impayée depuis 15 jours. Sans règlement, la suite de la commande reste en attente.",
  ],
  [
    "Relance J+30",
    "Paiement",
    "30 jours après l’échéance",
    "Dernier rappel : facture {{numero}}",
    "Bonjour {{client}},\n\nDernier rappel pour la facture {{numero}}, impayée depuis 30 jours.",
  ],
  [
    "Paiement reçu",
    "Paiement",
    "À l’encaissement",
    "Paiement reçu : {{numero}}",
    "Bonjour {{client}},\n\nNous avons reçu le règlement de {{numero}}. Merci. La suite est dans votre espace.",
  ],
  [
    "Message de votre agent",
    "Message",
    "À chaque message",
    "Nouveau message sur {{numero}}",
    "Bonjour {{client}},\n\nVotre agent vous a écrit au sujet de {{numero}}. La réponse se fait dans votre espace, pas par retour de cet email.",
  ],
  [
    "Document ajouté",
    "Document",
    "À l’ajout d’une pièce",
    "Nouveau document : {{numero}}",
    "Bonjour {{client}},\n\nUne pièce a été ajoutée à votre dossier {{numero}}. Ouvrez Documents dans votre espace.",
  ],
];

export function isStubEmail(body: string) {
  return body.length < 320 && /L[’']équipe Sourcing Pick/.test(body);
}

export function isOldQuoteMail(body: string) {
  return /Ouvrez-le pour voir le détail ligne par ligne/.test(body);
}

export function quoteReceivedBody() {
  return DESIGNED_EMAILS.find((item) => item[0] === "Devis reçu")?.[4] || "";
}

export function refreshQuoteMail(
  text: string,
  quote: {
    clientName?: string;
    clientCompany?: string;
    number?: string;
    lines?: QuoteLine[];
    goodsBps?: number;
    freightBps?: number;
    depositBps?: number;
    validityDays?: number;
    incoterm?: string;
  },
  link = "",
) {
  const math = quoteMath(quote.lines || [], Number(quote.goodsBps) || 0, Number(quote.freightBps) || 0, Number(quote.depositBps) || 0);
  const days = Math.max(0, Math.round(Number(quote.validityDays) || 0));
  const values: Record<string, string> = {
    "{{client}}": quote.clientName || "",
    "{{numero}}": quote.number || "",
    "{{societe}}": quote.clientCompany || quote.clientName || "",
    "{{lien}}": link,
    "{{montant}}": euros(math.totalCents),
    "{{acompte}}": `${percent(Number(quote.depositBps) || 0)} % soit ${euros(math.depositCents)}`,
    "{{solde}}": euros(math.balanceCents),
    "{{validite}}": String(days),
    "{{livraison}}": quote.incoterm || "DAP",
    "{{code}}": "",
  };
  let next = String(text ?? "");
  for (const [key, value] of Object.entries(values)) next = next.split(key).join(value);
  const line = (label: string, value: string) => {
    const name = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return next.replace(new RegExp(`(${name}(?:\\s|&nbsp;)*:(?:\\s|&nbsp;)*)([^\\n<]*)`, "gi"), `$1${value}`);
  };
  next = line("Montant du devis", euros(math.totalCents));
  next = line("Acompte à la commande", `${percent(Number(quote.depositBps) || 0)} % soit ${euros(math.depositCents)}`);
  next = line("Solde avant expédition", euros(math.balanceCents));
  next = line("Validité", `${days} jours`);
  next = line("Livraison", quote.incoterm || "DAP");
  return next;
}
