# 📧 Notification System - Implementation Guide

## ✅ What's Implemented

### 1. **Test Mode for Emails** 📧
- If `EMAIL_USER` and `EMAIL_PASSWORD` are NOT configured, emails go to **test mode**
- Test mode logs what would be sent but doesn't actually send emails
- To send real emails, configure your Gmail credentials in `.env` files

### 2. **User Email Settings Page** 📝
- Users can enter their own email address for notifications
- Users can opt-in/opt-out of receiving notifications
- Settings are saved to the database

### 3. **All Users Get Notifications** 📊
- Notifications are sent to ALL researchers with notification emails set
- Uses `getAllNotificationRecipients()` function
- Users can have custom notification emails (not tied to project lead)

---

## 🔧 Setup Steps

### Step 1: Configure Real Email (Optional)
To send real emails (not test mode), update `.env` files:

**research-service/.env:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**community-service/.env:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Get App Password:** Google Account > Security > App Passwords

### Step 2: Users Add Their Email
1. User logs in to the system
2. User clicks **🔔** notification icon
3. User clicks **"🔔 Notification Settings"**
4. User enters their email and saves

### Step 3: Test Notification System

**Test without real email (test mode):**
```powershell
Invoke-WebRequest -Uri "http://localhost:4001/notifications/check/all" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected output (in test mode):**
```
📧 [TEST MODE] Would send email to user@email.com:
   Subject: 🚨 Deadline Alert: Project Name - 7 days remaining
   Message: <HTML content here>...
   To actually send emails, set EMAIL_USER and EMAIL_PASSWORD in .env
```

**Test with actual email (after configuring credentials):**
```
✅ Email sent to user@email.com: <message-id>
```

---

## 📋 How It Works Now

### Notification Flow:
```
1. Scheduled check runs (8 AM, 9 AM, 10 AM)
   ↓
2. System finds condition (e.g., deadline in 7 days)
   ↓
3. System calls getAllNotificationRecipients()
   ↓
4. Gets ALL users with notificationEmail set
   ↓
5. For EACH user:
   - Creates notification in database
   - Sends email to user's notificationEmail
   ↓
6. User sees notification badge when they log in
   ↓
7. User clicks notification → see full list
```

---

## 🎯 Test Mode vs Real Mode

### Test Mode (Default - No Email Credentials):
- Logs what would be sent to console
- Saves notifications to database
- User sees "Would send email" messages
- **No actual emails sent**

### Real Mode (After Email Config):
- Sends actual emails via Gmail SMTP
- Saves notifications to database
- Shows "✅ Email sent" in console
- **Real emails delivered**

---

## 📱 Frontend Components Created

### 1. `NotificationBadge.js`
- Shows notification bell icon 🔔
- Displays unread count badge
- Click to open notifications dropdown
- Shows notification list with read/unread status

### 2. `NotificationSettings.js`
- Modal popup for email settings
- User enters their notification email
- Toggle to receive/not receive notifications
- Save settings button

---

## 🔌 API Endpoints Available

### Notification Endpoints (Research/Community):
```
GET    /user-notifications/user/:userId                    - Get user's notifications
GET    /user-notifications/user/:userId/unread-count       - Get unread count
PATCH  /user-notifications/:notificationId/read            - Mark as read
PATCH  /user-notifications/user/:userId/read-all           - Mark all as read
DELETE /user-notifications/:notificationId                 - Delete notification
DELETE /user-notifications/user/:userId/all                - Delete all
```

### Auth Endpoints:
```
GET    /auth/notification-settings        - Get user's notification settings
PUT    /auth/notification-email          - Update user's notification settings
```

---

## 🧪 Quick Test

### Test 1: Check Service Logs
Look for test mode messages:
```
📧 [TEST MODE] Would send email to user@email.com:
   Subject: Test Email
   Message: ...
```

### Test 2: Check Database
```javascript
// MongoDB Compass or CLI
use astu_analytics
db.notifications.find().pretty()
```

### Test 3: Check Frontend
1. Open http://localhost:3001
2. Login as user
3. Click 🔔 icon (top right)
4. See "🔔 Notification Settings" button
5. Click to open email settings modal
6. Enter email and save

---

## 📊 User Email Requirements

### What Users Need to Do:
1. **Add notification email** in settings page
2. **Enable notifications** (checkbox default: ON)
3. **Verify email** (if implementing email verification)

### System Requirements:
- User must have `role: 'researcher'` or `role: 'admin'`
- User must have `receiveNotifications: true`
- User must have `notificationEmail` set (not empty)

---

## ⚙️ Environment Configuration

**For Test Mode (No Email Config):**
```env
# Leave these as default - test mode will be automatic
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Real Email Mode:**
```env
# Set real credentials
EMAIL_USER=your-real-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

---

## 🎨 UI Integration

### Add to Navbar/Header:
```jsx
import NotificationBadge from './components/NotificationBadge';

// In your header component:
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
  <span>Welcome, {user.name}</span>
  <NotificationBadge 
    userId={user._id} 
    token={user.token} 
  />
  <button onClick={logout}>Logout</button>
</div>
```

### Add to Dashboard:
```jsx
import NotificationSettings from './components/NotificationSettings';

// Show modal when user clicks settings button:
const [showSettings, setShowSettings] = useState(false);

return (
  <div>
    <button onClick={() => setShowSettings(true)}>
      🔔 Notification Settings
    </button>
    {showSettings && (
      <NotificationSettings 
        userId={userId} 
        token={token} 
        onClose={() => setShowSettings(false)} 
      />
    )}
  </div>
);
```

---

## 🔍 Console Output Examples

### Test Mode Output:
```
📧 [TEST MODE] Would send email to abrahamgebreyohannes12@gmail.com:
   Subject: 🚨 Deadline Alert: IoT Smart Campus - 7 days remaining
   Message: <div style="font-family: Arial...">
   To actually send emails, set EMAIL_USER and EMAIL_PASSWORD in .env
✅ Notification created in database for Dr. Abraham
```

### Real Mode Output:
```
✅ Email sent to abrahamgebreyohannes12@gmail.com: <message-id>
✅ Notification created in database for Dr. Abraham
```

---

## ✅ Success Indicators

**Test Mode Working:**
- ✅ Console shows "📧 [TEST MODE] Would send email..."
- ✅ Notifications saved to database
- ✅ Frontend shows notification badge

**Real Email Working:**
- ✅ Console shows "✅ Email sent to..."
- ✅ Emails received in inbox
- ✅ Notifications saved to database

---

## 🐛 Troubleshooting

### "No notification emails set"
- Run `/auth/seed-emails` to seed user emails
- Or have users add emails via settings page

### "Test mode" messages showing
- This means email credentials not configured
- Configure `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### Emails not appearing in frontend
- Check browser console for API errors
- Verify user is logged in with correct token
- Check that user has notification email set

---

**Last Updated:** August 2, 2026  
**Version:** 3.0 - Test Mode + User Settings + All Users
