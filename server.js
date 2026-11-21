const express = require("express");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

// Page d'accueil
app.get("/", (req, res) => {
  res.send("AFRIKI SERVICE : serveur opérationnel !");
});

// Vérification du fonctionnement du serveur
app.get("/health", (req, res) => {
  res.json({
    service: "AFRIKI SERVICE",
    status: "ok",
    mode: "test",
    paymentsEnabled: false,
    mikrotikConnected: false
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("AFRIKI SERVICE démarré sur le port " + PORT);
});
