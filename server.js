const express = require("express");
const app = express();

app.get("/mortlake", (req, res) => {
  res.json({ status: "up" });
});

app.listen(3000);
