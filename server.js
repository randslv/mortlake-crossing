const express = require("express");
const stompit = require("stompit");

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => res.send("ok"));
app.listen(port, () => console.log(`HTTP running on ${port}`));

const connectOptions = {
  host: process.env.NR_HOST,
  port: Number(process.env.NR_PORT),
  connectHeaders: {
    host: "/",
    login: process.env.NR_USER,
    passcode: process.env.NR_PASS,
    "heart-beat": "5000,5000",
  },
};

stompit.connect(connectOptions, (err, client) => {
  if (err) {
    console.error("❌ STOMP connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to Network Rail (STOMP)");
});
