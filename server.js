const express = require("express");
const stompit = require("stompit");

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => res.send("ok"));
app.listen(port, () => console.log(`HTTP running on ${port}`));

const required = ["NR_HOST", "NR_PORT", "NR_USER", "NR_PASS", "NR_DEST"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

const connectOptions = {
  host: process.env.NR_HOST,
  port: Number(process.env.NR_PORT),
  connectHeaders: {
    host: "/",                 // vhost
    login: process.env.NR_USER,
    passcode: process.env.NR_PASS,
    "accept-version": "1.1,1.0",
    "heart-beat": "5000,5000"
  },
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
  };

  client.subscribe(subscribeHeaders, (subErr, message) => {
    if (subErr) {
      console.error("❌ Subscribe failed:", subErr.message);
      return;
    }
    console.log("✅ Subscribed to", process.env.NR_DEST);

    message.readString("utf8", (readErr, body) => {
      if (readErr) return;
      console.log("📨 message received");
      // For now we just prove messages arrive. We’ll parse/filter next.
    });
  });
});
