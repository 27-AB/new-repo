# 🔔 How to Set Your Notification Email

## 📍 Where Researchers Set Their Email

### Step 1: Login to the System
1. Go to http://localhost:3001
2. Login with your credentials

### Step 2: Go to Settings Page
1. After login, click **"Settings"** in the navigation
2. You'll see a page with "System Settings" title

### Step 3: Set Your Notification Email
1. Scroll down to find the **"🔔 Notification Settings"** card
2. Click **"Edit Settings"** button
3. A modal will open - enter your email address
4. Check the box "Receive notification emails" (default: ON)
5. Click **"Save Settings"**
6. Modal closes and you see confirmation message

---

## ✅ What Happens After You Set Your Email

### 1. Email Saved to Database
When you click Save, your email is saved in the `users` collection:

```javascript
{
  name: "Dr. Abraham Gebre",
  email: "abraham.gebre@astu.edu.et",
  notificationEmail: "abrahamgebreyohannes12@gmail.com",  // ← Your email
  receiveNotifications: true
}
```

### 2. Notifications Sent to Your Email
When any notification event happens:

**Example: Project deadline in 7 days**
```
1. System finds 10 projects with deadlines in 7 days
2. For each project, gets ALL researchers with notificationEmail set
3. Sends email to each researcher's notificationEmail

Result: ALL researchers get email at their own email address
```

**Console output (if no real email configured):**
```
📧 [TEST MODE] Would send email to abrahamgebreyohannes12@gmail.com:
   Subject: 🚨 Deadline Alert: IoT Smart Campus - 7 days remaining
   To actually send emails, set EMAIL_USER and EMAIL_PASSWORD in .env
```

**Console output (if email configured):**
```
✅ Email sent to abrahamgebreyohannes12@gmail.com: <message-id>
```

### 3. Notifications Saved to Database
Each notification is saved to `notifications` collection:
```javascript
{
  userId: ObjectId("..."),
  userName: "Dr. Abraham Gebre",
  userEmail: "abrahamgebreyohannes12@gmail.com",
  type: "deadline",
  title: "Deadline Alert: IoT Smart Campus",
  message: "Project deadline is approaching in 7 days",
  isRead: false,
  createdAt: Date("...")
}
```

### 4. Notifications Displayed in System
When you log in:
1. Click 🔔 notification bell icon (top right)
2. See **"🔔 Notification Settings"** button
3. See **"🔔 3 unread"** badge if you have unread notifications
4. Click bell icon to see notification list

---

## 🔄 Complete Flow Example

### Scenario: Research Project Deadline

**Day 1: User Sets Email**
```
User: "Login to http://localhost:3001"
User: "Click Settings → 🔔 Notification Settings"
User: "Enter: abrahamgebreyohannes12@gmail.com"
User: "Click Save"
Result: ✅ Email saved!
```

**Day 2: 7 Days Before Deadline**
```
System: "8:00 AM - Daily deadline check runs"
System: "Found 5 projects with deadline in 7 days"
System: "For project 'IoT Smart Campus':"
System: "  → Get project lead: Dr. Abraham Gebre"
System: "  → Look up user in database"
System: "  → Found notificationEmail: abrahamgebreyohannes12@gmail.com"
System: "  → Create notification in database"
System: "  → Send email to abrahamgebreyohannes12@gmail.com"
System: "✅ Email sent!"

User: "Check inbox: '🚨 Deadline Alert: IoT Smart Campus - 7 days remaining'"
```

**Day 3: User Logs In**
```
User: "Login to http://localhost:3001"
User: "See 🔔 icon with '🔔 3 unread' badge"
User: "Click 🔔 icon"
User: "See 3 notifications in dropdown:"
User: "  1. Deadline Alert: IoT Smart Campus - 7 days remaining"
User: "  2. Deadline Alert: Smart Grid System - 7 days remaining"
User: "  3. Ethics Approval Expiring: Climate Study - 14 days remaining"
User: "Click notification to mark as read"
```

---

## 📋 Email Configuration for Real Emails

### To Enable Real Email Sending:

1. **Get Gmail App Password:**
   - Go to Google Account: https://myaccount.google.com/
   - Click "Security" → "2-Step Verification"
   - Click "App passwords"
   - Select "Mail" and your device
   - Copy the 16-character password

2. **Update research-service/.env:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

3. **Update community-service/.env:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

4. **Restart services:**
- Stop and restart research and community services

---

## 🧪 Test Your Setup

### Test 1: Check Your Settings
1. Login to http://localhost:3001
2. Click **Settings**
3. Look for **"🔔 Notification Settings"** card
4. Verify your email is displayed

### Test 2: Trigger Notification Check
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing
```

### Test 3: Check Notifications in Database
```javascript
// MongoDB Compass or CLI
use astu_analytics
db.notifications.find({
  userEmail: "abrahamgebreyohannes12@gmail.com"
}).pretty()
```

---

## 📊 What Each Field Does

| Field | Purpose | Example |
|-------|---------|---------|
| `notificationEmail` | Where notifications are sent | `abrahamgebreyohannes12@gmail.com` |
| `receiveNotifications` | Enable/disable notifications | `true` or `false` |
| `notifications` (collection) | Stores all notifications | Database collection |

---

## ✅ Success Checklist

- [ ] User logs in to http://localhost:3001
- [ ] User goes to Settings page
- [ ] User sees "🔔 Notification Settings" card
- [ ] User enters their email address
- [ ] User clicks "Save Settings"
- [ ] Email saved to database
- [ ] System sends notifications to that email
- [ ] User sees notification badge when logged in

---

**Last Updated:** August 2, 2026  
**Version:** 5.0 - Complete Implementation
