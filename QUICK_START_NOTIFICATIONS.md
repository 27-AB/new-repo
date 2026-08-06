# 🚀 Quick Start Guide - Enhanced Notification System

## ✅ System is Ready!

All services are running with the new notification system:
- ✅ Research Service (http://localhost:4001) - with scheduler
- ✅ Community Service (http://localhost:4002) - with scheduler  
- ✅ Auth Service (http://localhost:4004)
- ✅ College Service (http://localhost:4003)
- ✅ Frontend (http://localhost:3001)
- ✅ User emails seeded (17 users updated)

---

## 🎯 What's New

### 1. **Personalized Emails** 📧
Each researcher now receives notifications at **their own email address**, not just a single test email.

### 2. **In-App Notifications** 🔔
Notifications are saved to the database so users can see them when they log in.

### 3. **Notification History** 📊
All notifications are tracked with read/unread status, timestamps, and metadata.

---

## 🧪 Test the System

### Test 1: Manual Notification Check

Trigger all checks manually:

```powershell
# Using PowerShell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing
```

**What happens:**
1. System checks for deadlines (7, 3, 1 days before)
2. System checks for overdue milestones
3. System checks for expiring ethics (30, 14, 7, 3 days before)
4. For each condition found:
   - Creates notification in database
   - Sends email to researcher's email
   - Logs result to console

### Test 2: Check User Notifications

Get notifications for a specific user:

```powershell
# Replace USER_ID with actual user ID from database
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/USER_ID" -UseBasicParsing
```

**Response:**
```json
{
  "notifications": [
    {
      "type": "deadline",
      "title": "Deadline Alert: Project Name",
      "message": "Project deadline approaching in 7 days",
      "priority": "medium",
      "isRead": false,
      "createdAt": "2026-08-02T..."
    }
  ],
  "total": 5,
  "unreadCount": 3
}
```

### Test 3: Get Unread Count

```powershell
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/USER_ID/unread-count" -UseBasicParsing
```

**Response:**
```json
{
  "unreadCount": 3
}
```

### Test 4: View All Users with Emails

```powershell
# Requires authentication token
Invoke-WebRequest -Uri "http://localhost:4004/auth/users-with-emails" `
  -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" } `
  -UseBasicParsing
```

---

## 📋 How Notifications Work Now

### Scenario: Project Deadline in 7 Days

1. **9:00 AM Daily Check Runs**
   ```
   🔍 Checking for upcoming deadlines...
   ```

2. **System Finds Project**
   ```
   Project: "IoT Smart Campus System"
   Lead: "Dr. Abraham Gebre"
   Deadline: August 9, 2026 (7 days away)
   ```

3. **Looks Up User Email**
   ```
   Query users collection for: "Dr. Abraham Gebre"
   Found: abraham.gebre@astu.edu.et
   Notification Email: abrahamgebreyohannes12@gmail.com
   ```

4. **Creates Notification in Database**
   ```javascript
   {
     userId: ObjectId("..."),
     userName: "Dr. Abraham Gebre",
     userEmail: "abrahamgebreyohannes12@gmail.com",
     type: "deadline",
     priority: "medium",
     title: "Deadline Alert: IoT Smart Campus System",
     message: "Project deadline is approaching in 7 days",
     projectId: ObjectId("..."),
     projectTitle: "IoT Smart Campus System",
     daysUntil: 7,
     isRead: false,
     emailSent: false
   }
   ```

5. **Sends Email**
   ```
   To: abrahamgebreyohannes12@gmail.com
   Subject: 🚨 Deadline Alert: IoT Smart Campus System - 7 days remaining
   ✅ Email sent successfully
   ```

6. **Updates Notification**
   ```javascript
   {
     ...
     emailSent: true,
     emailSentAt: Date("2026-08-02T09:00:00Z")
   }
   ```

7. **User Logs In Later**
   ```
   🔔 Notification Badge: 1 unread
   
   Notifications:
   ⏰ Deadline Alert: IoT Smart Campus System
      Project deadline is approaching in 7 days
      Just now • Unread
   ```

---

## 🔧 API Endpoints

### Notification Management

#### Get User Notifications
```
GET http://localhost:4001/user-notifications/user/:userId
Query params: limit, skip, unreadOnly=true/false
```

#### Get Unread Count
```
GET http://localhost:4001/user-notifications/user/:userId/unread-count
```

#### Mark as Read
```
PATCH http://localhost:4001/user-notifications/:notificationId/read
```

#### Mark All as Read
```
PATCH http://localhost:4001/user-notifications/user/:userId/read-all
```

#### Delete Notification
```
DELETE http://localhost:4001/user-notifications/:notificationId
```

#### Delete All
```
DELETE http://localhost:4001/user-notifications/user/:userId/all
```

### User Email Management

#### Seed All User Emails
```
POST http://localhost:4004/auth/seed-emails
```

#### Get Users with Emails (Admin only)
```
GET http://localhost:4004/auth/users-with-emails
Headers: Authorization: Bearer TOKEN
```

#### Update User Email (Admin only)
```
PUT http://localhost:4004/auth/users/:userId/email
Headers: Authorization: Bearer TOKEN
Body: { "email": "...", "notificationEmail": "..." }
```

### Notification Checks (Existing)

#### Check All
```
POST http://localhost:4001/notifications/check/all
```

#### Check Deadlines
```
POST http://localhost:4001/notifications/check/deadlines
```

#### Check Overdue
```
POST http://localhost:4001/notifications/check/overdue
```

#### Check Ethics
```
POST http://localhost:4001/notifications/check/ethics
```

---

## 📊 Console Logs to Watch For

### Successful Notification Creation:
```
🔍 Checking for upcoming deadlines...
💾 Notification saved to database for Dr. Abraham Gebre
✅ Email sent to abrahamgebreyohannes12@gmail.com: <message-id>
✅ Deadline check complete. 1 notification(s) sent.
```

### No Conditions Met:
```
🔍 Checking for upcoming deadlines...
✅ Deadline check complete. 0 notification(s) sent.
```

### User Email Lookup:
```
Query: { name: /^Dr. Abraham Gebre$/i }
Found user: abraham.gebre@astu.edu.et
Using notification email: abrahamgebreyohannes12@gmail.com
```

---

## 🎯 Testing Checklist

- [ ] All services running
- [ ] User emails seeded (17 users updated)
- [ ] Manual notification check works
- [ ] Notifications saved to database
- [ ] Emails sent to correct addresses
- [ ] Can fetch user notifications via API
- [ ] Unread count returns correctly
- [ ] Mark as read functionality works
- [ ] Scheduled checks running (8 AM, 9 AM, 10 AM)

---

## 🔍 How to Verify Everything Works

### 1. Check Service Logs

Look for these messages in the terminals:

**Research Service (Terminal 8):**
```
✅ Notification scheduler started successfully
📅 Scheduled tasks:
   - Daily deadline check: 9:00 AM
   - Daily overdue check: 10:00 AM
   - Daily ethics check: 8:00 AM
```

**Community Service (Terminal 9):**
```
✅ Notification scheduler started successfully
📅 Scheduled tasks:
   - Daily deadline check: 9:00 AM
   - Daily overdue check: 10:00 AM
   - Daily ethics check: 8:00 AM
```

### 2. Create Test Data

Create a project with a deadline 7 days from today to trigger a notification:

```javascript
// In MongoDB or via API
{
  title: "Test Project for Notifications",
  lead: "Dr. Abraham Gebre",  // Must match a user in database
  status: "active",
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days from now
}
```

### 3. Trigger Manual Check

```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing
```

### 4. Check Database

Using MongoDB Compass or CLI:
```javascript
// Connect to database
use astu_analytics

// View notifications
db.notifications.find().pretty()

// Count notifications per user
db.notifications.aggregate([
  { $group: { _id: "$userName", count: { $sum: 1 } } }
])
```

### 5. Check User Notifications

Get the userId from the database, then:
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/user-notifications/user/YOUR_USER_ID" -UseBasicParsing
```

---

## 🎉 Success Criteria

✅ **Email Delivery:** Each researcher receives emails at their own email address  
✅ **Database Storage:** All notifications saved with full metadata  
✅ **In-App Display:** Users can fetch their notifications via API  
✅ **Read/Unread Tracking:** Mark as read functionality works  
✅ **Unread Count:** Badge count returns correctly  
✅ **Automated Checks:** Schedulers running at 8 AM, 9 AM, 10 AM  
✅ **Manual Triggers:** Can trigger checks via API anytime  
✅ **All Notification Types:** Deadline, overdue, escalation, ethics all working  

---

## 📞 Support

For issues or questions, check:
1. Service console logs (terminals 7, 8, 9)
2. MongoDB for notification documents
3. NOTIFICATION_SYSTEM_COMPLETE.md for full documentation
4. TESTING_GUIDE.md for test scenarios

---

**Status:** 🟢 System Operational  
**Last Updated:** August 2, 2026  
**Version:** 2.0 - Complete Implementation with Database Storage
