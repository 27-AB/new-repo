# 📧 When & Where Notifications Are Sent

## 🎯 Quick Answer

**WHERE emails are sent:** All emails go to `abrahamgebreyohannes12@gmail.com`

**WHEN emails are sent:** Automatically every day at specific times, based on conditions

---

## 📍 WHERE Notifications Are Sent

### Email Address (Single Recipient)
```
abrahamgebreyohannes12@gmail.com
```

**All notification types go to this address:**
- ✅ Deadline warnings (7, 3, 1 days before)
- ✅ Overdue milestone alerts
- ✅ Escalation alerts (14+ days overdue)
- ✅ Ethics expiry warnings
- ✅ Test emails
- ✅ Custom notifications

### To Change Recipient Email:

Edit file: `research-service/.env`

```env
ALERT_EMAIL=abrahamgebreyohannes12@gmail.com
```

Change to your desired email address, then restart research service.

---

## ⏰ WHEN Notifications Are Sent

### Automatic Schedule (Daily)

The system runs **3 automated checks per day**:

#### 1. Ethics Check - 8:00 AM Daily
```
Time: 8:00 AM (every day)
Checks: Ethics approval expiry dates
Triggers: 30, 14, 7, or 3 days before expiry
Email: Ethics Expiring Warning
To: abrahamgebreyohannes12@gmail.com
```

**Example:**
- Ethics expires on August 15, 2026
- On July 16, 2026 at 8:00 AM → Email sent (30 days before)
- On August 1, 2026 at 8:00 AM → Email sent (14 days before)
- On August 8, 2026 at 8:00 AM → Email sent (7 days before)
- On August 12, 2026 at 8:00 AM → Email sent (3 days before)

#### 2. Deadline Check - 9:00 AM Daily
```
Time: 9:00 AM (every day)
Checks: Project end dates & milestone due dates
Triggers: 7, 3, or 1 days before deadline
Email: Deadline Warning
To: abrahamgebreyohannes12@gmail.com
```

**Example:**
- Milestone due on August 10, 2026
- On August 3, 2026 at 9:00 AM → Email sent (7 days before)
- On August 7, 2026 at 9:00 AM → Email sent (3 days before)
- On August 9, 2026 at 9:00 AM → Email sent (1 day before)

#### 3. Overdue & Escalation Check - 10:00 AM Daily
```
Time: 10:00 AM (every day)
Checks: Overdue milestones
Triggers: 
  - Any milestone past due date → Overdue email
  - Milestone 14+ days past due date → Escalation email
Email: Overdue Alert OR Escalation Alert
To: abrahamgebreyohannes12@gmail.com
```

**Example:**
- Milestone was due on July 20, 2026
- On July 21, 2026 at 10:00 AM → Overdue email sent (1 day late)
- On July 25, 2026 at 10:00 AM → Overdue email sent (5 days late)
- On August 3, 2026 at 10:00 AM → **ESCALATION email sent (14 days late)** 🚨
- Every day after → Escalation status maintained

---

## 📊 Complete Schedule Table

| Time | Check Type | Frequency | What It Checks | When Email Sent | Email Type |
|------|-----------|-----------|----------------|-----------------|------------|
| **8:00 AM** | Ethics | Daily | Ethics expiry dates | 30, 14, 7, 3 days before | 🛡️ Ethics Expiring |
| **9:00 AM** | Deadlines | Daily | Project & milestone deadlines | 7, 3, 1 days before | ⏰ Deadline Warning |
| **10:00 AM** | Overdue | Daily | Overdue milestones | Any days past due | 🚨 Overdue Alert |
| **10:00 AM** | Escalation | Daily | Very overdue milestones | 14+ days past due | 📢 Escalation Alert |

---

## 📧 Email Types & Triggers

### 1. Deadline Warning Email ⏰
**Subject:** 🚨 Deadline Alert: [Project Name] - X days remaining

**When Sent:**
- 7 days before deadline
- 3 days before deadline
- 1 day before deadline

**Check Time:** 9:00 AM daily

**Sent To:** abrahamgebreyohannes12@gmail.com (as project lead)

**Example Timeline:**
```
Aug 1, 9 AM  → Email: "7 days remaining" (due Aug 8)
Aug 5, 9 AM  → Email: "3 days remaining" (due Aug 8)
Aug 7, 9 AM  → Email: "1 day remaining" (due Aug 8)
```

---

### 2. Overdue Alert Email 🚨
**Subject:** 🚨 URGENT: Milestone Overdue - [Project Name] (X days late)

**When Sent:**
- Every day the milestone is overdue (past due date)
- Status is NOT "completed" or "cancelled"

**Check Time:** 10:00 AM daily

**Sent To:** abrahamgebreyohannes12@gmail.com (as project lead)

**Example Timeline:**
```
Jul 20  → Due date
Jul 21, 10 AM → Email: "1 day overdue"
Jul 22, 10 AM → Email: "2 days overdue"
Jul 23, 10 AM → Email: "3 days overdue"
... continues daily until completed
```

---

### 3. Escalation Alert Email 📢
**Subject:** 🚨 ESCALATION: [Project Name] - Milestone X days overdue

**When Sent:**
- When milestone is 14 or more days past due date
- Only sent once (milestone marked as "escalated")
- Included with overdue alert

**Check Time:** 10:00 AM daily

**Sent To:** abrahamgebreyohannes12@gmail.com (as Department Head)

**Example Timeline:**
```
Jul 20  → Due date
Jul 21-Aug 2 → Daily overdue emails
Aug 3, 10 AM → 🚨 ESCALATION EMAIL (14 days overdue)
                 + Overdue email continues
Aug 4, 10 AM → Overdue email only (already escalated)
```

**Important:** This email has special content:
- Addressed to "Department Head"
- Includes full project overview
- Shows college, lead, budget, dates
- Requests action from management
- Milestone marked as `escalated: true` in database

---

### 4. Ethics Expiring Email 🛡️
**Subject:** 🛡️ Ethics Approval Expiring Soon: [Project Name] - X days remaining

**When Sent:**
- 30 days before expiry
- 14 days before expiry
- 7 days before expiry
- 3 days before expiry

**Check Time:** 8:00 AM daily

**Sent To:** abrahamgebreyohannes12@gmail.com (as project lead)

**Example Timeline:**
```
Jul 15, 8 AM  → Email: "30 days remaining" (expires Aug 14)
Jul 31, 8 AM  → Email: "14 days remaining" (expires Aug 14)
Aug 7, 8 AM   → Email: "7 days remaining" (expires Aug 14)
Aug 11, 8 AM  → Email: "3 days remaining" (expires Aug 14)
```

---

## 🔄 Manual Triggers (Anytime)

You can also trigger checks manually:

### Via Notification Center UI:
1. Open http://localhost:3001
2. Go to Research Projects
3. Click **🔔 Notifications**
4. Click any button:
   - **⏰ Check Deadlines** → Runs deadline check now
   - **🚨 Check Overdue** → Runs overdue + escalation check now
   - **🛡️ Check Ethics** → Runs ethics check now
   - **🔍 Run All Checks** → Runs all 3 checks now

### Via API:
```bash
# Check all at once
curl -X POST http://localhost:4001/notifications/check/all

# Check deadlines only
curl -X POST http://localhost:4001/notifications/check/deadlines

# Check overdue only
curl -X POST http://localhost:4001/notifications/check/overdue

# Check ethics only
curl -X POST http://localhost:4001/notifications/check/ethics
```

---

## 🎯 Real-World Example

**Scenario:** Research project "IoT Smart Campus System"

### Project Details:
- Milestone: "First Quarter Report"
- Due Date: August 10, 2026
- Ethics Expires: September 15, 2026

### Email Timeline:

```
┌─────────────────────────────────────────────────────────┐
│ AUGUST 2026                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Aug 3, 9:00 AM                                         │
│ ✉️ Deadline Warning: 7 days remaining                  │
│ To: abrahamgebreyohannes12@gmail.com                   │
│                                                         │
│ Aug 7, 9:00 AM                                         │
│ ✉️ Deadline Warning: 3 days remaining                  │
│ To: abrahamgebreyohannes12@gmail.com                   │
│                                                         │
│ Aug 9, 9:00 AM                                         │
│ ✉️ Deadline Warning: 1 day remaining                   │
│ To: abrahamgebreyohannes12@gmail.com                   │
│                                                         │
│ Aug 10 → Due Date (milestone not completed)            │
│                                                         │
│ Aug 11, 10:00 AM                                       │
│ ✉️ Overdue Alert: 1 day overdue                        │
│ To: abrahamgebreyohannes12@gmail.com                   │
│                                                         │
│ Aug 12, 10:00 AM                                       │
│ ✉️ Overdue Alert: 2 days overdue                       │
│ To: abrahamgebreyohannes12@gmail.com                   │
│                                                         │
│ ... (continues daily) ...                              │
│                                                         │
│ Aug 16, 8:00 AM                                        │
│ ✉️ Ethics Expiring: 30 days remaining                  │
│ To: abrahamgebreyohannes12@gmail.com                   │
│                                                         │
│ Aug 24, 10:00 AM ← 14 days overdue!                    │
│ ✉️ 🚨 ESCALATION ALERT: 14 days overdue 🚨             │
│ ✉️ Overdue Alert: 14 days overdue                      │
│ To: abrahamgebreyohannes12@gmail.com (Dept Head)       │
│                                                         │
│ Aug 25, 10:00 AM                                       │
│ ✉️ Overdue Alert: 15 days overdue                      │
│ (No new escalation - already flagged)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 How to Verify Schedule

### Check Console Logs

When a check runs, you'll see:
```
🔍 Checking for upcoming deadlines...
✅ Deadline check complete. 2 alert(s) sent.

🔍 Checking for overdue milestones...
✅ Overdue check complete. 3 alert(s), 1 escalation(s) sent.

🔍 Checking for expiring ethics approvals...
✅ Ethics check complete. 1 alert(s) sent.
```

### Check Email Success

When email is sent:
```
✅ Email sent to abrahamgebreyohannes12@gmail.com: <message-id>
```

### Check Service Startup

When research service starts:
```
🚀 Starting notification scheduler...
✅ Notification scheduler started successfully
📅 Scheduled tasks:
   - Daily deadline check: 9:00 AM
   - Daily overdue check: 10:00 AM
   - Daily ethics check: 8:00 AM
```

---

## 📋 Summary

### WHERE:
✅ **All emails sent to:** abrahamgebreyohannes12@gmail.com

### WHEN (Automatic):
✅ **8:00 AM daily** → Ethics expiry check (30, 14, 7, 3 days before)  
✅ **9:00 AM daily** → Deadline check (7, 3, 1 days before)  
✅ **10:00 AM daily** → Overdue + Escalation check (any overdue, 14+ for escalation)

### WHEN (Manual):
✅ **Anytime** → Via Notification Center UI or API endpoints

### KEY ESCALATION RULE:
✅ **14+ days overdue** → Automatic escalation to Department Head  
✅ **Email marked as ESCALATION** with full project details  
✅ **Milestone marked as escalated** in database

---

## 🐛 Troubleshooting

### "Why didn't I receive an email?"

**Check:**
1. Is there a project/milestone meeting the conditions?
   - Deadline in 7, 3, or 1 days?
   - Milestone overdue?
   - Ethics expiring in 30, 14, 7, or 3 days?

2. Did the scheduled time pass?
   - Check current time vs schedule (8 AM, 9 AM, 10 AM)

3. Is email configured?
   - Check `.env` file has EMAIL_USER and EMAIL_PASSWORD
   - Check research service logs for errors

4. Check spam folder
   - Gmail might filter automated emails

### "How do I test without waiting?"

Use manual triggers:
- Click **🔍 Run All Checks** in Notification Center
- Or use API: `POST http://localhost:4001/notifications/check/all`

---

**Email Recipient:** abrahamgebreyohannes12@gmail.com  
**Schedule:** 8 AM (ethics), 9 AM (deadlines), 10 AM (overdue/escalation)  
**Escalation:** Automatic at 14+ days overdue  
**Status:** 🟢 Operational 24/7
