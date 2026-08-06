# 📧 Notification Flow - Complete Explanation

## ✅ What Happens Now

### Notification Sending Logic:
```
When a notification condition is met (deadline, overdue, ethics):

1. System finds project/milestone meeting condition
2. Calls createAndSendNotification(project, options)
3. getResearcherUser(project.lead) → Gets user who lead that project
4. Creates notification in database with:
   - userId: researcher.userId
   - userName: researcher.name
   - userEmail: researcher.email
5. Sends email to researcher.email
6. Saves notification to database
7. Notification appears in system when user logs in
```

### Who Gets Notifications:
- **ONLY the project lead** (project.lead field in project)
- NOT all researchers
- NOT users who didn't cause the notification

### Example:
```
Project: "IoT Smart Campus"
Lead: "Dr. Abraham Gebre"
Deadline: 7 days

Result:
✅ Dr. Abraham Gebre gets notification (project lead)
❌ Other researchers do NOT get this notification
```

---

## 🔔 Where Notifications Appear

### 1. **Email**
- Sent to project lead's `notificationEmail` field
- If not set, uses `email` field
- Test mode: logs to console if no email configured

### 2. **System UI**
- Notification saved to database
- User can see when they log in
- Click 🔔 bell icon to see list
- Badge shows unread count

---

## 📊 Complete Flow Example

### Scenario: Research Project Deadline in 7 Days

**Morning (9:00 AM - Scheduled Check):**
```
🔍 Checking for upcoming deadlines...

Found project: "IoT Smart Campus"
  Lead: "Dr. Abraham Gebre"
  End Date: August 9, 2026
  Days Until: 7 days ✅ (matches 7 days condition)

Looking up user: Dr. Abraham Gebre
  Found in database
  Email: abrahamgebreyohannes12@gmail.com

💾 Notification saved to database:
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

📧 [TEST MODE] Would send email to abrahamgebreyohannes12@gmail.com:
   Subject: 🚨 Deadline Alert: IoT Smart Campus - 7 days remaining
   To actually send emails, set EMAIL_USER and EMAIL_PASSWORD in .env

✅ Deadline check complete. 1 notification(s) sent.
```

**Result:**
- ✅ Dr. Abraham Gebre receives email at their email
- ✅ Notification saved to database
- ✅ When Dr. Abraham logs in, they see the notification in system

**Other Researchers:**
- ❌ Do NOT receive this notification
- ❌ Do NOT see it in their system
- ❌ Only notifications for projects they lead will appear

---

## 🔄 Notification Types & Who Gets Them

### 1. Deadline Warnings (7, 3, 1 days before)
```
Who: Project lead
Why: They need to manage the project deadline
```

### 2. Overdue Milestone Alerts
```
Who: Project lead
Why: They need to update the overdue milestone
```

### 3. Escalation Alerts (14+ days overdue)
```
Who: Project lead
Why: It's time to escalate - they need to handle it
```

### 4. Ethics Expiring Warnings (30, 14, 7, 3 days before)
```
Who: Project lead
Why: They need to renew ethics approval
```

---

## 🧪 How to Test

### Step 1: Set Your Notification Email
```
1. Login as researcher
2. Go to Settings
3. Notification Settings → Enter your email
4. Save
```

### Step 2: Create a Test Project
```
1. Go to Research Projects
2. Create project with:
   - Lead: Your name (must match database user)
   - End Date: 7 days from today
```

### Step 3: Trigger Check
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing
```

### Step 4: Check Console
Look for:
```
🔍 Checking for upcoming deadlines...
💾 Notification saved to database for [Your Name]
📧 [TEST MODE] Would send email to [Your Email]
✅ Deadline check complete. 1 notification(s) sent.
```

### Step 5: Check Database
```javascript
use astu_analytics
db.notifications.find({
  userName: "[Your Name]"
}).pretty()
```

### Step 6: Login to System
```
1. Logout and login again
2. Click 🔔 bell icon
3. See notification for your project
```

---

## ✅ Success Criteria

| Check | Expected Result |
|-------|-----------------|
| Console logs | Notification saved for project lead only |
| Database | Notification with project lead's userId |
| Email | Only project lead receives email |
| System UI | Only project lead sees notification |

---

## ⚙️ Email Configuration (For Real Emails)

**To enable real email sending:**

1. Get Gmail App Password
2. Update `research-service/.env`:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

3. Update `community-service/.env`:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

4. Restart research and community services

---

## 📋 Summary

**Who gets notifications:**
- ✅ **Project lead only** (the researcher who leads the project)
- ❌ NOT all researchers
- ❌ NOT random users

**Why this design:**
- Each researcher should only see notifications about their own projects
- Notifications are relevant to the project lead
- Reduces email noise for other researchers

**How to verify:**
1. Check console logs - shows "saved to database for [User Name]"
2. Check database - notification has specific userId
3. Login as different users - only project lead sees it
