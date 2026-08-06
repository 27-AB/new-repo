# 🚀 FINANCIAL & COMPLIANCE FEATURES - QUICK START
**5-Minute Guide** | Ready to Use Now

---

## ✅ WHAT'S NEW

### 1. 💰 Budget Tracker
Track every expense and prevent overspending

### 2. 🛡️ Ethics Compliance
Monitor IRB approvals and auto-lock expired projects

---

## 🎯 HOW TO ACCESS

1. **Open**: http://localhost:3001/research

2. **Look for NEW buttons** in the Actions column:
   ```
   [Timeline] [Milestones] [💰 Budget] [🛡️ Ethics] [📊 Gantt]
   ```

3. **Click them!** 🎉

---

## 💰 BUDGET TRACKER FEATURES

### What You'll See:
```
┌────────────────────────────────────────────────────┐
│ 💰 Budget & Expenditure Tracking                   │
│ Project Title Here                                 │
└────────────────────────────────────────────────────┘

Budget Summary:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Budget│ Total Spent │   Pending   │  Remaining  │
│  500,000 ብር │  200,000 ብር │  50,000 ብር │  250,000 ብር │
└─────────────┴─────────────┴─────────────┴─────────────┘

Budget Usage: 40.0%
████████████░░░░░░░░░░░░░░░░░░

✅ No issues - budget healthy!
```

### Quick Actions:
1. **+ Log Expense** → Add new expenditure
2. **✓ Approve** → Approve pending expenses (admin)
3. **✗ Reject** → Reject expenses (admin)
4. **✎ Edit** → Modify expense details
5. **✗ Delete** → Remove expense

---

## 🛡️ ETHICS COMPLIANCE FEATURES

### What You'll See:
```
┌────────────────────────────────────────────────────┐
│ 🛡️ Ethics & Compliance (IRB)                       │
│ Project Title Here                                 │
└────────────────────────────────────────────────────┘

Current Status: ✅ Approved

┌───────────────────────────────────────────────────┐
│ Approval Number: IRB-2026-001                     │
│ Institution: ASTU IRB                             │
│ Approval Date: Jan 15, 2026                       │
│ Expiry Date: Jan 15, 2027                         │
│                                                   │
│ ⏰ 167 days until expiry                          │
└───────────────────────────────────────────────────┘
```

### Alerts You'll See:

**30-Day Warning (Orange)**:
```
⚠️ Expiring Soon!
Ethics approval expires in 25 days. Please renew.
```

**Expired Alert (Red)**:
```
🚨 Ethics Approval Expired!
Expired 5 days ago. Project should be locked until renewed.
```

**Over Budget Alert (Red)**:
```
🚨 Over Budget!
Expenditure exceeds allocated budget by 50,000 ብር
```

---

## 📊 BUDGET LOGGING EXAMPLE

### Click "💰 Budget" → "+ Log Expense"

Fill this form:
```
Description*: Dell Latitude Laptop
Amount (ETB)*: 45000
Category*: Equipment
Date*: 2026-08-02
Receipt/Invoice #: INV-2026-0123
Vendor: Computer Shop Ltd
Notes: For lead researcher data analysis

[Create Expenditure] [Cancel]
```

### Result:
```
New expense appears with:
⏳ Pending status
- Admin must approve first
- Doesn't count toward spent yet

After admin clicks "✓ Approve":
✅ Approved status
- Counts toward budget
- Budget summary updates automatically
```

---

## 🛡️ ETHICS SETUP EXAMPLE

### Click "🛡️ Ethics" → "✎ Edit Ethics Information"

Fill this form:
```
Ethics Status*: Approved
Approval Number: IRB-2026-001
IRB Institution: ASTU Institutional Review Board
Approval Date: 2026-01-15
Expiry Date: 2027-01-15
Notes: Approved for human subjects research - 1 year

[Save Changes] [Cancel]
```

### Result:
```
Countdown starts:
⏰ 365 days until expiry

At 30 days remaining:
⚠️ Warning appears

At expiry:
🚨 Project auto-locks
🔒 No new expenses allowed
```

---

## 🎨 COLOR CODES

### Budget Usage:
- 🟢 **Green (0-75%)**: Healthy
- 🟡 **Yellow (75-90%)**: Caution
- 🟠 **Orange (90-100%)**: Warning
- 🔴 **Red (>100%)**: Over Budget! 🔒 Locked

### Ethics Status:
- ⚪ **Gray**: Not Required
- 🟡 **Yellow**: Pending Approval
- 🟢 **Green**: Approved & Valid
- 🟠 **Orange**: Expiring Soon (30 days)
- 🔴 **Red**: Expired! 🔒 Locked

---

## 🔒 LOCK SYSTEM

### When Projects Lock:

**Auto-Lock Triggers**:
1. ❌ **Over Budget**: Total spent > allocated budget
2. ❌ **Ethics Expired**: Past expiry date

**What Happens When Locked**:
- 🔒 Red lock notification appears
- ❌ Can't log new expenses
- ⚠️ Lock reason displayed
- 👤 Admin can unlock manually

**How to Unlock**:
- **Budget**: Increase budget OR reject some expenses
- **Ethics**: Renew ethics approval, update expiry date
- **Manual**: Admin clicks "🔓 Unlock Project"

---

## 📋 EXPENSE CATEGORIES

Choose from 10 categories:
1. 📦 Equipment
2. 👥 Personnel
3. 🧪 Materials
4. ✈️ Travel
5. 💻 Software
6. 🔧 Services
7. 📊 Overhead
8. 📄 Publication
9. 🎓 Training
10. 📝 Other

---

## 🎯 TYPICAL WORKFLOW

### Month 1: Setup
1. Create research project (budget: 500k)
2. Click **🛡️ Ethics** → Set to "Pending"
3. No expenses yet

### Month 2: Ethics Approved
1. Click **🛡️ Ethics** → Update to "Approved"
2. Set expiry: 1 year from today
3. System shows: "365 days until expiry" ✅

### Month 3: First Expenses
1. Click **💰 Budget** → "+ Log Expense"
2. Add 3 expenses (150k total)
3. Status: "Pending" ⏳

### Month 4: Admin Review
1. Admin clicks **💰 Budget**
2. Reviews pending expenses
3. Clicks **"✓ Approve"** on valid ones
4. Budget updates: 150k spent (30% used) 🟢

### Month 6: Mid-Project
1. More expenses logged: 200k total now
2. Budget: 350k/500k (70% used) 🟢
3. Ethics: 215 days remaining ✅

### Month 10: Warnings
1. Budget: 450k/500k (90% used) 🟠
2. Ethics: 25 days until expiry ⚠️
3. Alerts show orange warnings

### Month 11: Critical
1. **Scenario A** - Over Budget:
   - New expense pushes to 520k/500k
   - 🔒 **AUTO-LOCKS** project
   - Alert: "Over Budget by 20k!"

2. **Scenario B** - Ethics Expired:
   - Expiry date passes
   - 🔒 **AUTO-LOCKS** project
   - Alert: "Ethics Approval Expired!"

### Resolution:
1. Admin increases budget to 600k (unlocks automatically)
2. OR Admin renews ethics, updates expiry (can unlock manually)
3. Project resumes normal operations ✅

---

## ✅ QUICK CHECK

Before you start, verify:

- [ ] Research service running on port 4001 ✅
- [ ] Frontend running on port 3001 ✅
- [ ] Can access http://localhost:3001/research ✅
- [ ] Can see research projects table ✅
- [ ] Can see **💰 Budget** and **🛡️ Ethics** buttons ✅

If all checked, **you're ready to go!** 🎉

---

## 🎓 PRO TIPS

### For Researchers:
1. **Log expenses immediately** with receipt numbers
2. **Add detailed descriptions** for faster approval
3. **Attach receipts** when possible
4. **Monitor budget usage** regularly
5. **Renew ethics early** (don't wait for 30-day warning)

### For Admins:
1. **Review pending expenses daily**
2. **Check ethics expiry monthly** (use `/ethics/expiring` endpoint)
3. **Increase budgets proactively** if justified
4. **Use rejection reasons** to guide researchers
5. **Monitor lock status** across all projects

### For Compliance Officers:
1. **Run bulk ethics check**: `GET /ethics/expiring`
2. **Get expired projects**: `GET /ethics/expired`
3. **Export category breakdown**: For financial reporting
4. **Set calendar reminders**: 60 days before common expiry dates

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "Can't log expense - project locked"
**Cause**: Either over budget OR ethics expired  
**Fix**: Check lock reason in alert, resolve accordingly

### Issue: "Budget not updating after approval"
**Cause**: Page not refreshed  
**Fix**: Close modal and reopen Budget tracker

### Issue: "Ethics countdown not showing"
**Cause**: No expiry date set  
**Fix**: Edit ethics info, add expiry date

### Issue: "Can't approve expenses"
**Cause**: Not admin role  
**Fix**: Only admins can approve/reject

---

## 📞 NEED HELP?

**Documentation**: See `FINANCIAL_COMPLIANCE_IMPLEMENTATION.md`

**API Docs**: See endpoints section in implementation guide

**Test**: Try on a test project first before using on real data

---

## 🎉 YOU'RE ALL SET!

**Go try it now**:
1. Open http://localhost:3001/research
2. Click **💰 Budget** on any project
3. Click **🛡️ Ethics** on any project
4. Explore the features!

**Everything is working and ready to use!** 🚀
