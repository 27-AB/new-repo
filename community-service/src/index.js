const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const app = require("./app");
const { startNotificationScheduler } = require("./services/notificationScheduler");

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`community-service running on http://localhost:${PORT}`);
  console.log("  POST /community-projects/seed  ← run once");
  
  // Start notification scheduler
  startNotificationScheduler();
});
