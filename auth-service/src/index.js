const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const app = require("./app");
const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`auth-service running on http://localhost:${PORT}`);
  console.log("  POST /auth/login");
  console.log("  POST /auth/register");
  console.log("  GET  /auth/me");
  console.log("  POST /auth/seed  ← run once to create default users");
});
