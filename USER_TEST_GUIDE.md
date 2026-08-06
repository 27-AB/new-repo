# 🎯 USER TEST GUIDE - Milestone & Timeline Features

**Date**: August 2, 2026  
**Status**: ✅ Ready for Testing  
**System**: ASTU Analytics Portal

---

## 🚀 QUICK START

### Access the System
1. Open your browser
2. Go to: **http://localhost:3001**
3. Login with:
   - Email: `admin@astu.edu.et`
   - Password: `admin123`

---

## 📊 TEST 1: MILESTONES (Internal Checkpoints)

### What This Tests:
✅ First Quarter Report  
✅ Mid-term Review  
✅ Final Lab Test  
✅ Phase 1 & 2 Completion  
✅ Documentation  
✅ Progress tracking  

### Steps:
1. **Navigate**: Go to Research Projects page
2. **Find Project**: Look at any project in the table
3. **Click**: Click the **"Milestones"** button in the Actions column
4. **Observe**: You should see:

**Expected Result**:
```
◆ Project Milestones
Internal checkpoints & deliverable tracking

┌─────────────────────────────────────┐
│ Total: 6  Completed: 2              │
│ In Progress: 2  Overdue: 0          │
└─────────────────────────────────────┘

Timeline Rail (Visual):
◆────◆────◆────◆────◆────◆ (6 diamond markers)

Milestone Cards:
┌─────────────────────────────────────┐
│ ⏳ First Quarter Report              │
│ Priority: Medium | Status: Completed│
│ Due: Nov 15, 2023 | Progress: 100% │
│ ✅ Completed: Nov 8, 2023 (7d early)│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔄 Mid-term Review                   │
│ Priority: High | Status: In Progress│
│ Due: Feb 20, 2024 | Progress: 45%  │
│ 🔥 15 days remaining                │
└─────────────────────────────────────┘

... (4 more milestones)
```

### Interactive Features:
- ✅ **Search**: Type in search box to filter milestones
- ✅ **Filter**: Use status dropdown (All, Pending, In Progress, Completed, Overdue)
- ✅ **Sort**: Sort by Due Date, Priority, or Status
- ✅ **Edit**: Click ✎ button to edit a milestone
- ✅ **Complete**: Click ✓ button to mark as complete
- ✅ **Add New**: Click "+ Add Milestone" to create new checkpoint

### Success Criteria:
- [ ] Can see 6 milestones per project
- [ ] Timeline rail shows all milestones visually
- [ ] Progress rings display correctly
- [ ] Status badges show (Pending, In Progress, Completed, Overdue)
- [ ] Due dates and completion dates visible
- [ ] Can filter and search milestones
- [ ] Can create new milestones

---

## 📅 TEST 2: TIMELINE (Planned vs Actual)

### What This Tests:
✅ Planned Start & End dates  
✅ Actual Start & End dates  
✅ Variance calculation (days early/late/on-time)  
✅ Progress tracking per phase  

### Steps:
1. **Navigate**: Go to Research Projects page
2. **Click**: Click **"Timeline"** button on any project
3. **Create Phase**: Click **"+ Add Phase"** button
4. **Fill Form**:
   - Phase Title: "Literature Review Phase"
   - Description: "Comprehensive literature review"
   - Planned Start: Aug 1, 2026
   - Planned End: Oct 1, 2026
   - Actual Start: Aug 5, 2026 (4 days late)
   - Actual End: Oct 10, 2026 (9 days late)
   - Status: Completed
   - Priority: High
   - Progress: 100%
5. **Save**: Click "Create Phase"
6. **Observe**: You should see:

**Expected Result**:
```
📅 Timeline Phases
1 phase for Project Name — Planned vs Actual tracking

┌─────────────────────────────────────┐
│ Total: 1  Completed: 1              │
│ In Progress: 0  Delayed: 0          │
│ Avg Completion: 100%                │
└─────────────────────────────────────┘

Timeline Phase Card:
┌─────────────────────────────────────────────┐
│ ✅ Literature Review Phase                  │
│ Status: Completed | Priority: High         │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ 📅 Planned          ⏱ Actual          │  │
│ │ Aug 1 → Oct 1      Aug 5 → Oct 10    │  │
│ │ 62 days planned    67 days actual     │  │
│ │                                       │  │
│ │          Variance: +9d 🔴            │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ Progress: ████████████████████ 100%        │
└─────────────────────────────────────────────┘
```

### Interactive Features:
- ✅ **Add Phase**: Create multiple timeline phases
- ✅ **Edit**: Modify planned/actual dates
- ✅ **Track**: See variance automatically calculated
- ✅ **Color Coded**:
  - 🔴 Red = Delayed (positive days)
  - 🟢 Green = Early (negative days)
  - 🔵 Cyan = On Time (0 days)

### Success Criteria:
- [ ] Can create timeline phases
- [ ] Planned vs Actual dates display side-by-side
- [ ] Variance shows correctly (days early/late/on-time)
- [ ] Color coding works (red=late, green=early, cyan=on-time)
- [ ] Progress bar displays
- [ ] Can edit and delete phases

---

## 📊 TEST 3: GANTT CHART (Overlapping Schedules & Resource Crunch)

### What This Tests:
✅ Visual timeline of all projects  
✅ Overlapping project detection  
✅ Resource crunch period identification  
✅ Milestone visualization on timeline  

### Steps:
1. **Navigate**: Go to Research Projects page
2. **Click**: Click **"Gantt & Timeline View"** tab at the top
3. **Observe**: You should see:

**Expected Result**:
```
📊 Project Timeline — Gantt View
16 projects · 96 milestones · Planned vs Actual tracking

[Month] [Quarter] [Year] ← View mode toggles

Toggle Buttons:
[✓ Milestones] [✓ Actual Timeline] [✓ Crunch Periods]

⚠️ Resource Crunch Periods Detected
┌──────────────────────────────────┐
│ 5 projects overlapping           │
│ Jan 15 – Feb 20, 2024           │
│ 37 days high load               │
└──────────────────────────────────┘
(More crunch period cards...)

Gantt Chart:
Month Header:  Jan 2024 | Feb 2024 | Mar 2024 | ...
Day Header:    1 2 3 4 5 6 7 8 9 10 11 12 13 14 ...
               │     │TODAY│        │          │
Project 1      ▓▓▓▓▓▓▓▓▓▓◆▓▓▓▓▓▓▓▓▓▓▓▓
               └─ Planned ─┘
               ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ (Actual - RED if delayed)
                      ◆  ◆  ◆ (Milestones)

Project 2      ▓▓▓▓▓▓▓▓▓▓▓▓▓◆▓▓▓▓▓▓▓
               └──── Planned ────┘
               ▂▂▂▂▂▂▂▂▂▂ (Actual - GREEN if on time)
                    ◆  ◆  ◆ (Milestones)

... (14 more projects)

Color-coded days:
- Yellow background = 2-3 projects overlap
- Orange background = 4-5 projects overlap  
- Red background = 5+ projects overlap (HIGH CRUNCH!)
```

### Interactive Features:
- ✅ **Toggle Views**: Switch between Month, Quarter, Year
- ✅ **Toggle Features**:
  - Milestones ON/OFF
  - Actual Timeline ON/OFF
  - Crunch Periods ON/OFF
- ✅ **Hover**: Hover over bars/diamonds for details
- ✅ **Click Project**: Click a row to see detailed breakdown
- ✅ **Scroll**: Horizontal scroll to see full timeline

### Crunch Period Detection:
The chart automatically detects when multiple projects run simultaneously:
- **2 projects** = Light yellow background (mild overlap)
- **3 projects** = Yellow background (moderate overlap)
- **4 projects** = Orange background (high overlap)
- **5+ projects** = Red background (CRITICAL CRUNCH!)

**Alert Banner Shows Top 5 Crunch Periods**:
```
┌────────────────────────────────┐
│ 5 projects overlapping         │ ← CRITICAL
│ Jan 15 – Feb 20               │
│ 37 days high load             │
└────────────────────────────────┘
```

### Success Criteria:
- [ ] Can see all 16 projects on horizontal timeline
- [ ] Planned bars visible (colored by status)
- [ ] Actual bars visible below planned (when toggled)
- [ ] Milestone diamonds appear on timeline
- [ ] Today marker (vertical line) shows current date
- [ ] Overlapping schedules highlighted with colored backgrounds
- [ ] Resource crunch alert banner appears
- [ ] Can toggle view modes (Month/Quarter/Year)
- [ ] Can toggle features on/off
- [ ] Clicking a project shows detailed breakdown

---

## 🎯 COMPREHENSIVE TEST CHECKLIST

### Basic Functionality
- [ ] Login works
- [ ] Research Projects page loads
- [ ] Project table displays with data
- [ ] All buttons visible (Timeline, Milestones, Gantt)

### Milestone Features
- [ ] Milestones button opens MilestoneManager
- [ ] 6 milestones visible per project
- [ ] Timeline rail visualization displays
- [ ] Progress rings show percentages
- [ ] Status badges color-coded
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] Sort by date/priority/status works
- [ ] Can create new milestone
- [ ] Can edit existing milestone
- [ ] Can mark milestone as complete
- [ ] Can delete milestone

### Timeline Features
- [ ] Timeline button opens TimelineManager
- [ ] Can create new timeline phase
- [ ] Planned dates input works
- [ ] Actual dates input works
- [ ] Variance calculation automatic
- [ ] Color coding correct (red/green/cyan)
- [ ] Progress tracking works
- [ ] Can edit timeline phase
- [ ] Can delete timeline phase

### Gantt Chart Features
- [ ] Gantt tab displays chart
- [ ] All projects visible
- [ ] Month header shows months
- [ ] Day cells visible
- [ ] Planned bars display
- [ ] Actual bars display (when toggled)
- [ ] Milestone diamonds visible
- [ ] Today marker shows current date
- [ ] Overlapping schedules highlighted
- [ ] Crunch period alert appears
- [ ] Can toggle Month/Quarter/Year
- [ ] Can toggle Milestones on/off
- [ ] Can toggle Actual Timeline on/off
- [ ] Can toggle Crunch Periods on/off
- [ ] Clicking project shows details
- [ ] Horizontal scroll works

### Data Verification
- [ ] 96 total milestones exist
- [ ] 16 research projects exist
- [ ] 6 milestones per project
- [ ] Milestone types correct (First Quarter, Mid-term, etc.)
- [ ] Due dates realistic
- [ ] Status values appropriate
- [ ] Progress percentages visible

---

## 🐛 TROUBLESHOOTING

### If Nothing Shows:
1. Check browser console (F12 → Console)
2. Verify services are running:
   ```bash
   curl http://localhost:4001/health  # Research service
   curl http://localhost:3001         # Frontend
   ```
3. Refresh the page (Ctrl+F5 for hard refresh)

### If Milestones Are Empty:
1. Check data was seeded:
   ```bash
   curl http://localhost:4001/milestones/all
   ```
2. Should return array with 96 milestones
3. If empty, reseed:
   ```bash
   curl -X POST http://localhost:4001/milestones/seed
   ```

### If Timeline Is Empty:
This is **EXPECTED**! Timeline phases must be created manually:
1. Click "Timeline" button
2. Click "+ Add Phase"
3. Fill in the form
4. Save

### If Gantt Shows No Data:
1. Verify projects exist
2. Check milestones were seeded
3. Try refreshing the page
4. Check browser console for errors

### If You See Errors:
1. Open browser console (F12)
2. Look for red error messages
3. Check Network tab for failed requests (red items)
4. Share error message for debugging

---

## ✅ SUCCESS METRICS

After completing all tests, you should be able to confirm:

### ✅ Temporal Precision Feature 1: Internal Checkpoints
- **Working**: Can view and manage milestones
- **Data**: 96 milestones across 16 projects
- **Types**: First Quarter Report, Mid-term Review, Final Lab Test, Phase 1/2, Documentation
- **Features**: Create, edit, delete, search, filter, sort, complete

### ✅ Temporal Precision Feature 2: Gantt Chart with Overlaps
- **Working**: Visual timeline showing all projects
- **Detection**: Overlapping schedules highlighted
- **Crunch Alerts**: Banner showing high-load periods
- **Features**: Multiple views, toggles, interactive exploration

### ✅ Temporal Precision Feature 3: Planned vs Actual
- **Working**: Timeline phases with dual date tracking
- **Variance**: Automatic calculation of delays/early completion
- **Visualization**: Color-coded indicators (red/green/cyan)
- **Features**: Create phases, track progress, monitor delays

---

## 📞 SUPPORT

If you encounter any issues:

1. **Check**: FINAL_FIX_SUMMARY.md for detailed information
2. **Verify**: All services are running (see status above)
3. **Review**: Browser console for errors
4. **Test**: API endpoints directly with curl

**System is ready for testing!** 🚀

Go to **http://localhost:3001/research** and start exploring the Milestone, Timeline, and Gantt Chart features!
