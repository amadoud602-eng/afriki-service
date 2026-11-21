const express = require("express");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

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

app.get("/", (req, res) => {
  res.send("AFRIKI SERVICE : serveur opérationnel !");
});app.get("/conditions", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Conditions d'utilisation - AFRIKI SERVICE</title>
    </head>
    <body style="font-family:Arial;max-width:800px;margin:30px auto;padding:20px;line-height:1.6">
      <h1>AFRIKI SERVICE</h1>
      <h2>Conditions générales d'utilisation du Wi-Fi</h2>

      <p>Bienvenue sur AFRIKI SERVICE, votre service d'accès Internet Wi-Fi.</p>

      <h3>1. Accès au service</h3>
      <p>L'accès à Internet est réservé aux utilisateurs disposant d'un forfait valide.</p>

      <h3>2. Paiement</h3>
      <p>Les forfaits sont payables selon les tarifs affichés sur le portail.</p>

      <h3>3. Utilisation responsable</h3>
      <p>L'utilisateur s'engage à respecter les lois en vigueur et à ne pas utiliser le réseau pour des activités illégales.</p>

      <h3>4. Sécurité</h3>
      <p>L'utilisateur est responsable de la sécurité de son appareil et de ses identifiants de connexion.</p>

      <h3>5. Disponibilité</h3>
      <p>Le service peut être temporairement interrompu pour des raisons techniques ou de maintenance.</p>

      <h3>6. Assistance</h3>
      <p>Pour toute difficulté, veuillez contacter le responsable d'AFRIKI SERVICE.</p>

      <p><strong>AFRIKI SERVICE - Sénégal</strong></p>
    </body>
    </html>
  `);
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("AFRIKI SERVICE démarré sur le port " + PORT);
});
