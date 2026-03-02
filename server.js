const express = require("express");
const stompit = require("stompit");

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => res.send("ok"));
app.listen(port, () => console.log(`HTTP running on ${port}`));

// ---- Validate required env vars ----
const required = ["NR_HOST", "NR_PORT", "NR_USER", "NR_PASS", "NR_DEST", "NR_GROUP"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// ---- STOMP connection ----
const connectOptions = {
  host: process.env.NR_HOST,
  port: Number(process.env.NR_PORT),
  connectHeaders: {
    host: "/", // vhost
    login: process.env.NR_USER,
    passcode: process.env.NR_PASS,
    "heart-beat": "5000,5000",
    "client-id": process.env.NR_GROUP // consumer group key
  }
};

console.log("Connecting to Network Rail STOMP...");

stompit.connect(connectOptions, (err, client) => {
  if (err) {
    console.error("❌ STOMP connection failed:", err.message);
    return;
  }

  console.log("✅ Connected to Network Rail");

  const subscribeHeaders = {
    destination: process.env.NR_DEST,
    ack: "auto",
    id: process.env.NR_GROUP
  };

  client.subscribe(subscribeHeaders, (subErr, message) => {
    if (subErr) {
      console.error("❌ Subscription failed:", subErr.message);
      return;
    }

    message.readString("utf8", (readErr, body) => {
      if (readErr) return;

      try {
        const parsed = JSON.parse(body);
        console.log("📨 TD message received");
      } catch (e) {
        // ignore parse errors
      }
    });
  });
});
