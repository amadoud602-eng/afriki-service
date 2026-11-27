const express = require("express");
const { createHmac, timingSafeEqual, randomBytes } = require("crypto");
const { Pool } = require("pg");
const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
app.post("/webhooks/221", express.raw({ type: "application/json" }), async (req, res) => {
  const raw = req.body.toString("utf8");
  const timestamp = req.get("X-221-Timestamp");
  const signature = req.get("X-221-Signature");
  const secret = process.env.WEBHOOK_SECRET;

  if (!timestamp || !signature || !secret) {
    return res.sendStatus(400);
  }

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));

  if (!Number.isFinite(age) || age > 300) {
    return res.sendStatus(400);
  }

  const expected = "v1=" + createHmac("sha256", secret)
    .update(`${timestamp}.${raw}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.sendStatus(400);
  }

  try {
    const event = JSON.parse(raw);

    if (!event.id || !event.type) {
      return res.sendStatus(400);
    }
 if (!["payment.succeeded", "payment.failed", "payment.expired"].includes(event.type)) {
      return res.sendStatus(200);
    }

    if (!event.object_id) {
      return res.sendStatus(400);
    }
const dejaTraite = await pool.query(
  `SELECT id FROM webhook_events WHERE id = $1`,
  [event.id]
);

if (dejaTraite.rowCount > 0) {
  console.log("Événement déjà traité :", event.id);
  return res.sendStatus(200);
}
    const apiKey = (process.env.ORVLABS_API_KEY || "").trim();
    const apiUrl = process.env.ORVLABS_API_URL;

    const verification = await fetch(
      `${apiUrl}/v1/payments/${event.object_id}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );

    if (!verification.ok) {
      console.error("Vérification 221 Pay impossible :", verification.status);
      return res.sendStatus(500);
    }

  const paiement = await verification.json();

const resultat = await pool.query(
  `UPDATE paiements
   SET statut = $1::varchar(30),
       date_confirmation = CASE
         WHEN $1::varchar(30) = 'confirmed' THEN NOW()
         ELSE date_confirmation
       END,
       activation_status = CASE
         WHEN $1::varchar(30) = 'confirmed' THEN 'waiting'
         ELSE activation_status
       END
   WHERE paiement_id = $2`,
  [paiement.status, event.object_id]
);
    if (resultat.rowCount === 0) {
      console.error("Paiement introuvable dans Neon");
      return res.sendStatus(500);
    }

    await pool.query(
      `INSERT INTO webhook_events (id, type)
       VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [event.id, event.type]
    );

    console.log("Statut du paiement enregistré :", paiement.status);

    return res.sendStatus(200);

  } catch (error) {
    console.error("Erreur webhook 221 Pay :", error);
    return res.sendStatus(500);
  }
});
app.use(express.json({ limit: "20kb" }));
app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS heure");
    return res.json({
      database: "connected",
      heure: result.rows[0].heure
    });
  } catch (error) {
   console.error("Erreur connexion Neon :", error);
    return res.status(503).json({
      database: "disconnected"
    });
  }
});
const forfaits = [
  {
    id: "jour",
    nom: "Pass 1 jour",
    prix: 200,
    duree: "24 heures"
  },
  {
    id: "semaine",
    nom: "Pass 1 semaine",
    prix: 700,
    duree: "7 jours"
  },
  {
    id: "quinzaine",
    nom: "Pass 2 semaines",
    prix: 1200,
    duree: "14 jours"
  },
  {
    id: "mois",
    nom: "Pass 1 mois",
    prix: 2000,
    duree: "30 jours"
  }
];
// Page d'accueil
app.get("/", (req, res) => {
  res.send("AFRIKI SERVICE : serveur opérationnel !");
});

// Conditions générales
app.get("/conditions", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Conditions générales - AFRIKI SERVICE</title>
  <meta name="description" content="Conditions générales d'utilisation du Wi-Fi AFRIKI SERVICE au Sénégal.">

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 850px;
      margin: 30px auto;
      padding: 20px;
      line-height: 1.7;
      color: #222;
      background: #f5f7fa;
    }

    main {
      background: white;
      padding: 25px;
      border-radius: 12px;
    }

    h1, h2 {
      color: #075b45;
    }

    h2 {
      margin-top: 28px;
    }
  </style>
</head>

<body>
  <main>
    <h1>AFRIKI SERVICE</h1>
    <h2>Conditions générales d'utilisation du Wi-Fi</h2>

    <p><strong>Éditeur du service :</strong> AFRIKI SERVICE</p>
    <p><strong>Localisation :</strong> Bargny, Sénégal</p>
    <p><strong>Contact :</strong> +221 70 674 29 74</p>

    <h2>1. Objet du service</h2>
    <p>AFRIKI SERVICE propose un accès Internet sans fil (Wi-Fi) payant aux utilisateurs disposant d'un forfait valide.</p>

    <h2>2. Forfaits et tarifs</h2>
    <ul>
      <li>Pass 1 jour (24 heures) : 200 FCFA</li>
      <li>Pass 1 semaine (7 jours) : 700 FCFA</li>
      <li>Pass 2 semaines (14 jours) : 1 200 FCFA</li>
      <li>Pass 1 mois (30 jours) : 2 000 FCFA</li>
    </ul>

    <h2>3. Paiement</h2>
    <p>Le paiement s'effectue par les moyens proposés sur le portail officiel. L'accès est accordé après confirmation du paiement.</p>

    <h2>4. Utilisation du réseau</h2>
    <p>L'utilisateur s'engage à respecter les lois du Sénégal et à ne pas utiliser le réseau pour des activités frauduleuses ou illégales.</p>

    <h2>5. Identifiants et sécurité</h2>
    <p>L'utilisateur doit préserver la confidentialité de ses identifiants et reste responsable de leur utilisation.</p>

    <h2>6. Disponibilité du service</h2>
    <p>Le service peut connaître des interruptions temporaires pour des raisons techniques ou de maintenance.</p>

    <h2>7. Remboursement et réclamations</h2>
    <p>Toute réclamation concernant un paiement ou un accès non fonctionnel peut être adressée à AFRIKI SERVICE au numéro indiqué ci-dessus.</p>

    <h2>8. Données personnelles</h2>
    <p>Les informations nécessaires à la gestion des connexions et des paiements sont utilisées pour fournir et sécuriser le service.</p>

    <h2>9. Contact</h2>
    <p>Pour toute question ou réclamation, contactez AFRIKI SERVICE :</p>
    <p><strong>Téléphone : +221 70 674 29 74</strong></p>
    <p><strong>Localisation : Bargny, Sénégal</strong></p>

    <p>Dernière mise à jour : 26 novembre 2026.</p>
  </main>
</body>
</html>
  `);
});
app.get("/api/mikrotik/pingapp.get("/api/mikrotik/tickets", async (req, res) => {
  const secret = (process.env.MIKROTIK_POLL_TOKEN || "").trim();
  const authorization = req.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  const a = Buffer.from(secret);
  const b = Buffer.from(token);

  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.sendStatus(401);
  }

  try {
    const result = await pool.query(
      `SELECT id, reference, forfait, montant
       FROM paiements
       WHERE statut = 'confirmed'
       AND activation_status = 'waiting'
       ORDER BY date_confirmation ASC
       LIMIT 1`
    );

    return res.json(result.rows[0] || { message: "Aucun ticket en attente" });

  } catch (error) {
    console.error("Erreur récupération ticket :", error);
    return res.sendStatus(500);
  }
});", (req, res) => {
  const secret = (process.env.MIKROTIK_POLL_TOKEN || "").trim();
  const authorization = req.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  if (!secret) {
    return res.sendStatus(503);
  }

  const a = Buffer.from(secret);
  const b = Buffer.from(token);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.sendStatus(401);
  }

  return res.json({
    service: "AFRIKI SERVICE",
    mikrotik: "authorized",
    mode: "test"
  });
});
app.get("/health", (req, res) => {
  res.json({
    service: "AFRIKI SERVICE",
    status: "ok",
    mode: "test",
    paymentsEnabled: false,
    mikrotikConnected: false
  });
});

app.get("/plans", (req, res) => {
  res.json(forfaits);
});
app.post("/api/paiements", async (req, res) => {
  try {
    const { forfait, moyen } = req.body || {};

    const plan = forfaits.find((p) => p.id === forfait);

    if (!plan || !["wave", "orange"].includes(moyen)) {
      return res.status(400).json({
        erreur: "Forfait ou moyen de paiement invalide"
      });
    }
const apiKey = (process.env.ORVLABS_API_KEY || "").trim();
    const apiUrl = process.env.ORVLABS_API_URL;
  console.log("Clé API chargée :", Boolean(apiKey));
console.log("Adresse API configurée :", Boolean(apiUrl));
   if (!apiKey) {
      return res.status(503).json({
        erreur: "Clé de paiement de test indisponible"
      });
    }

    const reference =
      "AFRIKI-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 8);

    const response = await fetch(`${apiUrl}/v1/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": reference
      },
      body: JSON.stringify({
        amount: String(plan.prix),
        currency: "XOF",
        rail: moyen === "wave" ? "sn_wave" : "sn_orange",
        merchant_reference: reference,
        return_url: "https://afriki-service-1.onrender.com/"
      })
    });

    const resultat = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        erreur: "221 Pay n'a pas accepté la demande"
      });
    }
await pool.query(
  `INSERT INTO paiements
   (reference, paiement_id, forfait, montant, moyen, statut)
   VALUES ($1, $2, $3, $4, $5, $6)`,
  [
    reference,
    resultat.id,
    forfait,
    plan.prix,
    moyen,
    resultat.status || "pending"
  ]
);
    return res.json({
      statut: resultat.status,
      paiement: resultat.id,
      lien: resultat.checkout_url
    });

  } catch (erreur) {
    console.error("Erreur création paiement :", erreur.message);

    return res.status(500).json({
      erreur: "Erreur lors de la création du paiement"
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("AFRIKI SERVICE démarré sur le port " + PORT);
});
