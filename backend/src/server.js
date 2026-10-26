const app = require("./app");
const env = require("./config/env");
const { autoSubmitExpired } = require("./services/attempts.service");

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});

// Every minute: auto-submit any attempt whose time has run out.
setInterval(() => {
  autoSubmitExpired()
    .then((n) => n > 0 && console.log(`Auto-submitted ${n} expired attempt(s)`))
    .catch((e) => console.error("Auto-submit job failed:", e.message));
}, 60 * 1000);
