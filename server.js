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
