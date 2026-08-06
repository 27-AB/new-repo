const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const app = require("./app");
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`college-service running on http://localhost:${PORT}`);
  console.log("  POST /seed  ← run once to populate colleges & researchers");
});
