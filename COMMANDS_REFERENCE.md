# 🎯 Quick Command Reference

## Common Operations with PowerShell

### 📧 Email Management

#### Seed All User Emails
```powershell
Invoke-WebRequest -Uri "http://localhost:4004/auth/seed-emails" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### View All Users with Emails (Requires Auth Token)
```powershell
$token = "YOUR_JWT_TOKEN"
Invoke-WebRequest -Uri "http://localhost:4004/auth/users-with-emails" -Headers @{ "Authorization" = "Bearer $token" } -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### 🔔 Notification Checks

#### Run All Checks
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Check Deadlines Only
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/deadlines" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Check Overdue Only
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/overdue" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Check Ethics Only
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/ethics" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### 📬 User Notifications

#### Get User's Notifications
```powershell
$userId = "USER_ID_HERE"
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/$userId" -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Get Unread Count
```powershell
$userId = "USER_ID_HERE"
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/$userId/unread-count" -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Mark Notification as Read
```powershell
$notificationId = "NOTIFICATION_ID_HERE"
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/$notificationId/read" -Method PATCH -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Mark All as Read
```powershell
$userId = "USER_ID_HERE"
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/$userId/read-all" -Method PATCH -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Delete Notification
```powershell
$notificationId = "NOTIFICATION_ID_HERE"
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/$notificationId" -Method DELETE -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### 🧪 Testing

#### Send Test Email
```powershell
$body = @{ to = "test@example.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:4001/notifications/test" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Send Custom Notification
```powershell
$body = @{
    to = "test@example.com"
    subject = "Custom Subject"
    message = "Custom message text"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4001/notifications/custom" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### 🔍 Health Checks

#### Check All Services
```powershell
Write-Host "Auth Service:" -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:4004/health" -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nResearch Service:" -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:4001/health" -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nCommunity Service:" -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:4002/health" -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nCollege Service:" -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:4003/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

### 📊 Database Queries (MongoDB CLI)

#### Connect to Database
```bash
mongosh "mongodb+srv://astu-admin:admin1234@cluster0.9rtg1yo.mongodb.net/astu_analytics"
```

#### View All Notifications
```javascript
db.notifications.find().pretty()
```

#### Count Notifications by User
```javascript
db.notifications.aggregate([
  { $group: { _id: "$userName", count: { $sum: 1 } } }
])
```

#### Count Unread Notifications
```javascript
db.notifications.countDocuments({ isRead: false })
```

#### View Recent Notifications
```javascript
db.notifications.find().sort({ createdAt: -1 }).limit(10).pretty()
```

#### View Notifications by Type
```javascript
db.notifications.find({ type: "deadline" }).pretty()
```

#### Delete All Notifications (Careful!)
```javascript
db.notifications.deleteMany({})
```

---

### 🎨 Formatted Output (Pretty JSON)

#### Get Notifications with Pretty Print
```powershell
$userId = "USER_ID_HERE"
$response = Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/$userId" -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

### 📝 Quick Scripts

#### Check System Status Script
```powershell
# Save as: check-system.ps1

Write-Host "=== ASTU Analytics System Status ===" -ForegroundColor Green

# Check services
$services = @(
    @{ Name = "Auth"; Port = 4004 },
    @{ Name = "Research"; Port = 4001 },
    @{ Name = "Community"; Port = 4002 },
    @{ Name = "College"; Port = 4003 }
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -UseBasicParsing -TimeoutSec 2
        Write-Host "✅ $($service.Name) Service: Running" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) Service: Not responding" -ForegroundColor Red
    }
}

# Check notifications
Write-Host "`n=== Notification System ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing
    Write-Host "✅ Notification checks completed" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "❌ Notification system error" -ForegroundColor Red
}
```

#### Run: `.\check-system.ps1`

---

### 🔧 Troubleshooting Commands

#### Restart Research Service
```powershell
# Stop (use terminal ID from list_processes)
# Then start:
cd "c:\Users\hp\Downloads\Telegram Desktop\astu-analytics(AI)\astu-analytics(AI)\astu-analytics(new)\research-service"
npm start
```

#### Clear All Notifications (Fresh Start)
```javascript
// In MongoDB
use astu_analytics
db.notifications.deleteMany({})
```

#### View Service Logs
Check the terminal windows for:
- Terminal 7: Auth Service
- Terminal 8: Research Service
- Terminal 9: Community Service

---

### 💡 Tips

1. **Get User ID:**
   ```powershell
   # Login first to get token
   $body = @{ email = "admin@astu.edu.et"; password = "admin123" } | ConvertTo-Json
   $response = Invoke-WebRequest -Uri "http://localhost:4004/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
   $token = ($response.Content | ConvertFrom-Json).token
   
   # Get user info
   $me = Invoke-WebRequest -Uri "http://localhost:4004/auth/me" -Headers @{ "Authorization" = "Bearer $token" } -UseBasicParsing
   $userId = ($me.Content | ConvertFrom-Json)._id
   Write-Host "Your User ID: $userId"
   ```

2. **Save Token for Multiple Requests:**
   ```powershell
   $token = "YOUR_JWT_TOKEN"
   $headers = @{ "Authorization" = "Bearer $token" }
   
   # Use in requests
   Invoke-WebRequest -Uri "http://localhost:4004/auth/me" -Headers $headers -UseBasicParsing
   ```

3. **Pretty Print All Responses:**
   ```powershell
   # Add to end of commands:
   | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
   ```

---

## 📋 API Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/seed-emails` | POST | Seed all user emails |
| `/auth/users-with-emails` | GET | Get all users (admin) |
| `/notifications/check/all` | POST | Run all checks |
| `/notifications/check/deadlines` | POST | Check deadlines |
| `/notifications/check/overdue` | POST | Check overdue |
| `/notifications/check/ethics` | POST | Check ethics |
| `/user-notifications/user/:userId` | GET | Get notifications |
| `/user-notifications/user/:userId/unread-count` | GET | Get unread count |
| `/user-notifications/:id/read` | PATCH | Mark as read |
| `/user-notifications/user/:userId/read-all` | PATCH | Mark all as read |
| `/user-notifications/:id` | DELETE | Delete notification |

---

**Pro Tip:** Save frequently used commands as PowerShell scripts (.ps1 files) for quick access!
