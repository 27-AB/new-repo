# 🧪 Notification System - Quick Testing Guide

**Testing URL:** http://localhost:3001  
**Test Email:** abrahamgebreyohannes12@gmail.com

---

## ✅ Pre-Test Checklist

Verify all services are running:
- [x] Frontend: http://localhost:3001
- [x] Auth Service: http://localhost:4000
- [x] Research Service: http://localhost:4001 (with scheduler)
- [x] Community Service: http://localhost:4002 (with scheduler)

---

## 📋 Test Scenarios

### Test 1: Access Notification Center (Research)

1. **Navigate:** http://localhost:3001/research
2. **Login:** Use admin or researcher credentials
3. **Click:** 🔔 Notifications button (top right)
4. **Verify:** Modal opens with:
   - System Status panel
   - Quick Action buttons
   - Test Email section
   - Custom Notification section

**Expected Result:** ✅ Modal opens successfully

---

### Test 2: Access Notification Center (Community)

1. **Navigate:** http://localhost:3001/community
2. **Login:** Use admin or researcher credentials
3. **Click:** 🔔 Notifications button (top right)
4. **Verify:** Modal opens (same as Test 1)

**Expected Result:** ✅ Modal opens successfully

---

### Test 3: Send Test Email (Research)

1. **Open:** Research Notification Center
2. **Section:** "Send Test Email"
3. **Email Field:** Pre-filled with `abrahamgebreyohannes12@gmail.com`
4. **Click:** 📤 Send Test button
5. **Wait:** 2-3 seconds
6. **Check:** Success message appears

**Expected Result:** 
- ✅ Success message: "✅ Test email sent successfully to abrahamgebreyohannes12@gmail.com!"
- ⚠️ Email won't actually be received unless EMAIL_USER and EMAIL_PASSWORD are configured in .env

**Check Console Logs:**
```bash
# Research service terminal
✅ Email sent to abrahamgebreyohannes12@gmail.com: <messageId>
```

---

### Test 4: Send Test Email (Community)

1. **Open:** Community Notification Center
2. **Repeat:** Steps from Test 3
3. **Verify:** Same success behavior

**Expected Result:** ✅ Success message appears

---

### Test 5: Check Deadlines (Manual)

1. **Open:** Research or Community Notification Center
2. **Click:** ⏰ Check Deadlines button
3. **Wait:** System scans database
4. **Check:** Success message with count

**Expected Result:**
- If deadlines found (7, 3, or 1 days away): "✅ Deadlines check completed! X notification(s) sent."
- If no deadlines: "✅ Deadlines check completed! 0 notification(s) sent."

---

### Test 6: Check Overdue Milestones (Manual)

1. **Open:** Notification Center
2. **Click:** 🚨 Check Overdue button
3. **Wait:** System scans for overdue milestones
4. **Check:** Success message

**Expected Result:**
- Shows count of alerts and escalations sent
- If milestone is 14+ days overdue, escalation email sent to Department Head

---

### Test 7: Check Ethics Expiring (Manual)

1. **Open:** Notification Center
2. **Click:** 🛡️ Check Ethics button
3. **Wait:** System scans for expiring ethics approvals
4. **Check:** Success message

**Expected Result:**
- If ethics approvals expiring (30, 14, 7, or 3 days): Shows count
- If none expiring: "✅ Ethics check completed! 0 notification(s) sent."

---

### Test 8: Run All Checks

1. **Open:** Notification Center
2. **Click:** 🔍 Run All Checks button
3. **Wait:** System runs all three checks
4. **Check:** Success message with total count

**Expected Result:**
- "✅ All checks completed! X notification(s) sent."
- X = sum of all three check types

---

### Test 9: Send Custom Notification

1. **Open:** Notification Center
2. **Section:** "Send Custom Notification"
3. **Fill:**
   - To: `abrahamgebreyohannes12@gmail.com` (pre-filled)
   - Subject: "Test Custom Notification"
   - Message: "This is a test message from the notification system."
4. **Click:** 📨 Send Custom Notification button
5. **Check:** Success message

**Expected Result:** 
- ✅ "✅ Custom notification sent to abrahamgebreyohannes12@gmail.com!"
- Form fields reset

---

### Test 10: Verify Scheduler is Running

**Check Research Service Logs:**
```bash
# Terminal 24 output
research-service running on http://localhost:4001
🚀 Starting notification scheduler...
✅ Notification scheduler started successfully
📅 Scheduled tasks:
   - Daily deadline check: 9:00 AM
   - Daily overdue check: 10:00 AM
   - Daily ethics check: 8:00 AM
```

**Check Community Service Logs:**
```bash
# Terminal 25 output
community-service running on http://localhost:4002
🚀 Starting notification scheduler...
✅ Notification scheduler started successfully
📅 Scheduled tasks:
   - Daily deadline check: 9:00 AM
   - Daily overdue check: 10:00 AM
   - Daily ethics check: 8:00 AM
```

**Expected Result:** ✅ Both schedulers show as started

---

### Test 11: Check Database for User Emails

**Using MongoDB Compass or CLI:**
1. **Connect:** mongodb+srv://astu-admin:admin1234@cluster0.9rtg1yo.mongodb.net/
2. **Database:** astu_analytics
3. **Collection:** users
4. **Find:** Any user document
5. **Verify Fields:**
   - `name`: String (used to match project.lead)
   - `email`: String (primary email)
   - `notificationEmail`: String (optional, for notifications)

**Expected Result:** ✅ Users have email and/or notificationEmail fields

---

### Test 12: Create Project with Deadline

**Test Deadline Notification:**
1. **Go to:** Research or Community Projects
2. **Click:** + Add Project button
3. **Fill Form:**
   - Title: "Test Project - Deadline Alert"
   - Lead: [Your researcher name]
   - Status: Active
   - End Date: [Set to 7 days from today]
4. **Save** project
5. **Open:** Notification Center
6. **Click:** ⏰ Check Deadlines
7. **Verify:** Email sent notification

**Expected Result:** 
- ✅ System finds the project
- ✅ Sends deadline warning email
- ✅ Success message: "1 notification(s) sent"

---

### Test 13: Create Overdue Milestone

**Test Overdue Notification:**
1. **Go to:** Any project
2. **Click:** Milestones button
3. **Create Milestone:**
   - Title: "Test Overdue Milestone"
   - Due Date: [Set to yesterday]
   - Status: In Progress
4. **Save** milestone
5. **Open:** Notification Center
6. **Click:** 🚨 Check Overdue
7. **Verify:** Email sent notification

**Expected Result:**
- ✅ System finds overdue milestone
- ✅ Sends overdue alert
- ✅ Success message shows count

---

### Test 14: Test Escalation (14+ Days Overdue)

**Requires:** Milestone 14+ days overdue

1. **Database Edit (MongoDB Compass):**
   - Find milestone created in Test 13
   - Set `dueDate` to 15 days ago
   - Save
2. **Open:** Notification Center
3. **Click:** 🚨 Check Overdue
4. **Verify:** 
   - Alert sent to project lead
   - Escalation sent to Department Head
   - Milestone marked as `escalated: true`

**Expected Result:**
- ✅ "1 alert(s), 1 escalation(s) sent"
- ✅ Milestone has `escalated: true` in database

---

## 🔍 Debugging Tips

### If Notification Button Not Visible:
- Check user role (must be admin or researcher)
- Refresh page (Ctrl+F5)
- Check browser console for errors

### If Modal Doesn't Open:
- Check browser console for errors
- Verify NotificationCenter component imported
- Check showNotifications state

### If API Calls Fail:
- Verify services are running (ports 4001, 4002)
- Check network tab in browser DevTools
- Verify JWT token is being sent

### If Emails Not Sent (API says success but no email):
- **This is expected** until EMAIL_USER and EMAIL_PASSWORD are configured
- System uses nodemailer with Gmail SMTP
- Without credentials, transporter creates but emails don't send
- Not an error - just needs configuration

### To Actually Send Emails:
1. **Go to:** https://myaccount.google.com/apppasswords
2. **Create:** New App Password for "ASTU Analytics"
3. **Copy:** 16-character password
4. **Edit:** `research-service/.env` and `community-service/.env`
   ```env
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```
5. **Restart:** Both research and community services
6. **Test:** Send test email again

---

## 📊 Expected Console Logs

### Successful Email Send:
```
✅ Email sent to abrahamgebreyohannes12@gmail.com: <250-mx.google.com-randomId>
```

### Failed Email Send (No credentials):
```
❌ Failed to send email to abrahamgebreyohannes12@gmail.com: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Deadline Check (None Found):
```
🔍 Checking for upcoming deadlines...
✅ Deadline check complete. 0 alert(s) sent.
```

### Overdue Check (Found Some):
```
🔍 Checking for overdue milestones...
✅ Email sent to researcher@astu.edu.et: <messageId>
✅ Email sent to abrahamgebreyohannes12@gmail.com: <messageId>  // Escalation
✅ Overdue check complete. 2 alert(s), 1 escalation(s) sent.
```

---

## ✅ Test Summary Checklist

- [ ] Research Notification Center opens
- [ ] Community Notification Center opens
- [ ] Test email sends successfully (research)
- [ ] Test email sends successfully (community)
- [ ] Check Deadlines works
- [ ] Check Overdue works
- [ ] Check Ethics works
- [ ] Run All Checks works
- [ ] Custom notification sends
- [ ] Schedulers are running
- [ ] User emails in database
- [ ] Project deadline detection works
- [ ] Overdue milestone detection works
- [ ] Escalation (14+ days) works

---

## 🎉 Success Criteria

**System is working if:**
1. ✅ All UI buttons visible and clickable
2. ✅ Modals open without errors
3. ✅ API calls return success responses
4. ✅ Console logs show "✅ Email sent" messages
5. ✅ Schedulers start on service boot
6. ✅ Database queries find correct data

**Email delivery works if:**
- Gmail credentials configured in .env
- Test email actually received in inbox
- HTML formatting displays correctly

---

**Last Updated:** August 2, 2026  
**Version:** 1.0
