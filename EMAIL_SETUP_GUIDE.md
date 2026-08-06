# 📧 Email Notification Setup Guide

## ✅ Notification System Installed!

The automated notification system is now active and running. Here's how to complete the setup:

---

## 🔧 Gmail SMTP Configuration

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification

### Step 2: Create an App Password

1. After enabling 2-Step Verification, return to **Security**
2. Under "How you sign in to Google", click **App passwords**
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **ASTU Analytics**
6. Click **Generate**
7. **COPY THE 16-CHARACTER PASSWORD** (you won't see it again!)

### Step 3: Update .env File

Edit the file: `research-service/.env`

Replace these lines:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
ALERT_EMAIL=abrahamgebreyohannes12@gmail.com
```

With your actual credentials:
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (16-character app password)
ALERT_EMAIL=abrahamgebreyohannes12@gmail.com
```

**IMPORTANT:** Use the App Password, NOT your regular Gmail password!

---

## 🧪 Testing the Email System

### Method 1: Using API (Recommended)

Send a test email using curl or Postman:

```bash
curl -X POST http://localhost:4001/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email": "abrahamgebreyohannes12@gmail.com"}'
```

Or using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:4001/notifications/test" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"abrahamgebreyohannes12@gmail.com"}'
```

### Method 2: Using Browser

1. Open: http://localhost:3001
2. Open browser console (F12)
3. Run this JavaScript:
```javascript
fetch('http://localhost:4001/notifications/test', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'abrahamgebreyohannes12@gmail.com'})
})
.then(r => r.json())
.then(data => console.log('✅ Response:', data))
.catch(e => console.error('❌ Error:', e));
```

### Expected Response:

```json
{
  "success": true,
  "message": "Test email sent successfully to abrahamgebreyohannes12@gmail.com",
  "messageId": "<unique-message-id>"
}
```

---

## 📊 Notification System Features

### 🔔 Automated Alerts

The system automatically checks and sends emails for:

1. **Deadline Warnings** (7 days before)
   - Project end dates
   - Milestone due dates
   - Checks daily at 9:00 AM

2. **Overdue Milestones**
   - Any milestone past due date
   - Checks daily at 10:00 AM

3. **Escalations** (14+ days overdue)
   - Automatically notifies Department Head
   - Marks milestone as "escalated"
   - Checks daily at 10:00 AM

4. **Ethics Expiring** (30, 14, 7, 3 days before)
   - Ethics approval expiry warnings
   - Checks daily at 8:00 AM

### 📅 Schedule

| Check Type | Frequency | Time | Triggers |
|------------|-----------|------|----------|
| Deadlines | Daily | 9:00 AM | 7, 3, 1 days before |
| Overdue | Daily | 10:00 AM | Any overdue milestone |
| Escalation | Daily | 10:00 AM | 14+ days overdue |
| Ethics | Daily | 8:00 AM | 30, 14, 7, 3 days before expiry |

---

## 🎯 API Endpoints

All endpoints are available at: `http://localhost:4001/notifications/`

### POST /notifications/test
Send a test email
```json
{
  "email": "abrahamgebreyohannes12@gmail.com"
}
```

### POST /notifications/check/all
Manually run all checks (deadlines, overdue, ethics)
```bash
curl -X POST http://localhost:4001/notifications/check/all
```

### POST /notifications/check/deadlines
Check only upcoming deadlines
```bash
curl -X POST http://localhost:4001/notifications/check/deadlines
```

### POST /notifications/check/overdue
Check only overdue milestones
```bash
curl -X POST http://localhost:4001/notifications/check/overdue
```

### POST /notifications/check/ethics
Check only expiring ethics approvals
```bash
curl -X POST http://localhost:4001/notifications/check/ethics
```

### GET /notifications/settings
Get current notification settings
```bash
curl http://localhost:4001/notifications/settings
```

### POST /notifications/custom
Send custom notification
```json
{
  "to": "recipient@email.com",
  "subject": "Custom Subject",
  "message": "Your custom message here"
}
```

---

## 📧 Email Templates

### 1. Deadline Warning Email

Sent when a deadline is approaching (7, 3, or 1 days before)

**Subject:** 🚨 Deadline Alert: [Project Title] - X days remaining

**Contains:**
- Project name and details
- Days remaining (highlighted)
- Project lead and status
- Link to dashboard

**Color:** Yellow/Orange

---

### 2. Milestone Overdue Email

Sent when a milestone is past its due date

**Subject:** 🚨 URGENT: Milestone Overdue - [Project Title] (X days late)

**Contains:**
- Project name
- Milestone title
- Days overdue (highlighted)
- Current status
- Link to update milestone

**Color:** Red

**Special:** If 14+ days overdue, includes escalation notice

---

### 3. Escalation Alert Email

Sent to Department Head when milestone is 14+ days overdue

**Subject:** 🚨 ESCALATION: [Project Title] - Milestone X days overdue

**Contains:**
- Department Head greeting
- Project overview (college, lead, budget)
- Milestone details
- Days overdue
- Action required notice
- Link to review project

**Color:** Dark Red

---

### 4. Ethics Expiring Email

Sent when ethics approval is expiring (30, 14, 7, 3 days before)

**Subject:** 🛡️ Ethics Approval Expiring Soon: [Project Title] - X days remaining

**Contains:**
- Project name
- Ethics approval number
- Expiry date
- Days remaining
- Renewal instructions
- Auto-lock warning

**Color:** Yellow/Orange

---

## 🔍 Monitoring & Logs

### Check if Scheduler is Running

Look for these messages in the research-service console:
```
🚀 Starting notification scheduler...
✅ Notification scheduler started successfully
📅 Scheduled tasks:
   - Daily deadline check: 9:00 AM
   - Daily overdue check: 10:00 AM
   - Daily ethics check: 8:00 AM
```

### Check Email Sending

When emails are sent, you'll see:
```
🔍 Checking for upcoming deadlines...
✅ Email sent to abrahamgebreyohannes12@gmail.com: <message-id>
✅ Deadline check complete. 1 alert(s) sent.
```

### Error Messages

If email fails:
```
❌ Failed to send email to user@email.com: [error message]
```

Common errors:
- **Invalid login:** Wrong email or app password
- **Less secure app access:** Need to enable 2-Step and create App Password
- **Connection timeout:** Check internet connection

---

## 🎨 Customization

### Change Alert Email Address

Edit `.env`:
```env
ALERT_EMAIL=your-preferred-email@domain.com
```

### Change Schedule Times

Edit `research-service/src/services/notificationScheduler.js`:

```javascript
// Daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  await checkUpcomingDeadlines();
});

// Change to 8:30 AM:
cron.schedule('30 8 * * *', async () => {
  await checkUpcomingDeadlines();
});
```

Cron format: `minute hour * * *`
- `0 9 * * *` = 9:00 AM daily
- `30 8 * * *` = 8:30 AM daily
- `0 14 * * *` = 2:00 PM daily
- `*/5 * * * *` = Every 5 minutes (testing)

### Change Escalation Threshold

Edit `research-service/src/services/notificationService.js`:

```javascript
// Current: 14 days
if (daysOverdue > 14) {
  // Send escalation
}

// Change to 7 days:
if (daysOverdue > 7) {
  // Send escalation
}
```

### Change Deadline Warning Days

Edit `research-service/src/services/notificationService.js`:

```javascript
// Current: 7, 3, 1 days before
if (daysUntil === 7 || daysUntil === 3 || daysUntil === 1) {
  // Send warning
}

// Change to 10, 5, 2 days before:
if (daysUntil === 10 || daysUntil === 5 || daysUntil === 2) {
  // Send warning
}
```

---

## 🚨 Troubleshooting

### Emails Not Sending

1. **Check .env configuration**
   - Email and password correct?
   - Using App Password (not regular password)?

2. **Check service logs**
   - Look for error messages
   - Check if scheduler started

3. **Test manually**
   - Use `/notifications/test` endpoint
   - Check response for errors

4. **Verify Gmail settings**
   - 2-Step Verification enabled?
   - App Password generated?
   - Less secure apps NOT enabled (use App Password instead)

### Scheduler Not Running

1. **Check service startup logs**
   - Should see "Starting notification scheduler"
   - If missing, check index.js

2. **Restart research service**
   - Stop and start again
   - Check for errors

### Wrong Email Recipient

1. **Update .env**
   ```env
   ALERT_EMAIL=correct-email@domain.com
   ```

2. **Restart service**
   - Changes require restart

---

## ✅ Verification Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password created
- [ ] .env file updated with email and app password
- [ ] Research service restarted
- [ ] Scheduler startup message appears in logs
- [ ] Test email sent successfully
- [ ] Test email received in inbox
- [ ] All endpoints responding correctly

---

## 📞 Support

If you need help:
1. Check service logs for error messages
2. Verify email configuration in .env
3. Test with `/notifications/test` endpoint
4. Check Gmail settings (2-Step, App Password)
5. Ensure internet connection is active

---

**Status:** 🟢 Notification system installed and configured  
**Email Recipient:** abrahamgebreyohannes12@gmail.com  
**Service:** Research Service (Port 4001)  
**Scheduler:** Active (9:00 AM, 10:00 AM, 8:00 AM daily)

**Next Step:** Configure your Gmail App Password and test!
