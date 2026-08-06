const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const app = require("./app");
const { startNotificationScheduler } = require("./services/notificationScheduler");

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`research-service running on http://localhost:${PORT}`);
  console.log("  POST /projects/seed  ← run once to populate database");
  
  // Start notification scheduler
  startNotificationScheduler();
});
