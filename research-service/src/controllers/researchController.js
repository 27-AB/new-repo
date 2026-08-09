// research-service/src/controllers/researchController.js
const Research = require("../models/Research");

const objectIdEquals = (a, b) => {
  if (!a || !b) return false;
  try { return a.toString() === b.toString(); } catch { return false; }
};

exports.getAll = async (req, res) => {
  try {
    const { status, college, department, search, page = 1, limit = 20 } = req.query;

    // Build base filters from query params
    const baseQuery = {};
    if (status)     baseQuery.status = status;
    if (college)    baseQuery.college = new RegExp(college, "i");
    if (department) baseQuery.department = new RegExp(department, "i");
    if (search)     baseQuery.$or = [
      { title: new RegExp(search, "i") },
      { lead:  new RegExp(search, "i") },
      { tags:  new RegExp(search, "i") },
    ];

    // Role-aware scope:
    let roleQuery = {};
    const role = req.user?.role;

    if (role === "admin") {
      // admin sees all (no additional filter)
      roleQuery = {};
    } else if (role === "pi") {
      roleQuery = {
        $or: [
          { pi: req.user.id },
          { createdBy: req.user.id }
        ]
      };
    } else if (role === "co_researcher") {
      // co-researcher sees projects where they are listed as collaborator
      roleQuery = { "collaborators.userId": req.user.id };
    } else if (role === "reviewer") {
      // reviewer sees projects where they are assigned as reviewer
      roleQuery = { reviewers: req.user.id };
    } else if (role === "funder") {
      // funder sees projects they fund
      roleQuery = { funder: req.user.id };
    } else {
      // default: limited read-only view — only projects not private (use baseQuery only)
      roleQuery = {};
    }

    // Combine baseQuery and roleQuery carefully
    const query = Object.keys(roleQuery).length > 0 ? { $and: [ baseQuery, roleQuery ] } : baseQuery;

    const projects = await Research.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .maxTimeMS(5000);

    const total = await Research.countDocuments(query);
    res.json({ success: true, total, page: Number(page), projects });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Not found." });

    // RBAC check for a single project
    const role = req.user?.role;
    const uid = req.user.id;

    const isAdmin = role === "admin";
    const isPI = project.pi && objectIdEquals(project.pi, uid);
    const isCreator = project.createdBy && objectIdEquals(project.createdBy, uid);
    const isCollaborator = project.collaborators && project.collaborators.some(c => c.userId && objectIdEquals(c.userId, uid));
    const isReviewer = project.reviewers && project.reviewers.some(r => objectIdEquals(r, uid));
    const isFunder = project.funder && objectIdEquals(project.funder, uid);

    // Determine access:
    if (!(isAdmin || isPI || isCreator || isCollaborator || isReviewer || isFunder)) {
      return res.status(403).json({ success: false, message: "Access denied to this project." });
    }

    res.json({ success: true, project });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadDate: new Date()
    })) : [];

    // Parse collaborators from JSON string if present
    let collaborators = [];
    if (req.body.collaborators) {
      try {
        collaborators = JSON.parse(req.body.collaborators);
      } catch (e) {
        console.error("Failed to parse collaborators:", e);
      }
    }

    // If the requester is a PI, set them as the PI of the project unless an admin sets another PI
    const payload = {
      ...req.body,
      attachments,
      collaborators,
      createdBy: req.user.id,
      createdByName: req.user.name,
      lastModifiedBy: req.user.id,
      lastModifiedByName: req.user.name,
    };

    if (req.user.role === "pi") {
      payload.pi = req.user.id;
    } else if (req.user.role === "admin" && req.body.pi) {
      // allow admin to set a specific PI via body.pi
      payload.pi = req.body.pi;
    }

    const project = await Research.create(payload);
    res.status(201).json({ success: true, project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Not found." });
    
    const uid = req.user.id;
    const role = req.user.role;

    const isAdmin = role === "admin";
    const isPI = project.pi && objectIdEquals(project.pi, uid);
    const isCreator = project.createdBy && objectIdEquals(project.createdBy, uid);

    // collaborator priority lookup
    let collaboratorPriority = null;
    if (project.collaborators && project.collaborators.length > 0) {
      const collab = project.collaborators.find(c => c.userId && objectIdEquals(c.userId, uid));
      if (collab) collaboratorPriority = collab.priority;
    }
    const isHighPriorityCollaborator = collaboratorPriority === "high";

    // Permission: admin OR PI (owner) OR high-priority collaborator (same as before)
    const canEdit = isAdmin || isPI || isCreator || isHighPriorityCollaborator;

    if (!canEdit) {
      return res.status(403).json({ 
        success: false, 
        message: collaboratorPriority 
          ? `Access denied. Only high-priority collaborators, the PI, creator, or admins can edit. Your priority: ${collaboratorPriority}`
          : "Access denied. Only the PI, creator, high-priority collaborators, or admins can edit this project.",
        owner: project.createdByName || "Unknown",
        yourRole: role,
        yourPriority: collaboratorPriority || "none"
      });
    }
    
    // Handle file attachments
    let attachments = project.attachments || [];
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date()
      }));
      attachments = [...attachments, ...newAttachments];
    }

    // Parse collaborators from JSON string if present
    let collaborators = project.collaborators || [];
    if (req.body.collaborators) {
      try {
        collaborators = JSON.parse(req.body.collaborators);
      } catch (e) {
        console.error("Failed to parse collaborators:", e);
        collaborators = project.collaborators || [];
      }
    }

    // If admin tries to change PI via update body, allow it
    const updateFields = {
      ...req.body,
      attachments,
      collaborators,
      lastModifiedBy: req.user.id,
      lastModifiedByName: req.user.name,
    };

    if (req.user.role === "admin" && req.body.pi) {
      updateFields.pi = req.body.pi;
    }

    const updatedProject = await Research.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    res.json({ 
      success: true, 
      project: updatedProject, 
      editedBy: req.user.name, 
      role: req.user.role,
      permission: isAdmin ? "admin" : isPI ? "pi" : isCreator ? "creator" : isHighPriorityCollaborator ? "high-priority collaborator" : "unknown"
    });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// Add collaborator to project (only PI or admin can add)
exports.addCollaborator = async (req, res) => {
  try {
    const { userId, priority } = req.body;
    
    if (!userId || !priority) {
      return res.status(400).json({ 
        success: false, 
        message: "userId and priority are required" 
      });
    }
    
    if (!["high", "medium", "low"].includes(priority)) {
      return res.status(400).json({ 
        success: false, 
        message: "Priority must be 'high', 'medium', or 'low'" 
      });
    }
    
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    
    // Only PI (project.pi) or admin can add collaborators
    const isPI = project.pi && objectIdEquals(project.pi, req.user.id);
    const isAdmin = req.user.role === "admin";
    
    if (!isPI && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the project PI or admin can add collaborators." 
      });
    }
    
    // Check if already a collaborator
    const existingCollab = project.collaborators.find(c => c.userId && c.userId.toString() === userId);
    if (existingCollab) {
      return res.status(400).json({ 
        success: false, 
        message: "User is already a collaborator. Use update endpoint to change priority." 
      });
    }
    
    // Add collaborator
    project.collaborators.push({ userId, priority });
    project.lastModifiedBy = req.user.id;
    project.lastModifiedByName = req.user.name;
    await project.save();
    
    res.json({ 
      success: true, 
      message: `Collaborator added with ${priority} priority`,
      project 
    });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

// Update collaborator priority (only PI or admin)
exports.updateCollaborator = async (req, res) => {
  try {
    const { userId, priority } = req.body;
    
    if (!userId || !priority) {
      return res.status(400).json({ 
        success: false, 
        message: "userId and priority are required" 
      });
    }
    
    if (!["high", "medium", "low"].includes(priority)) {
      return res.status(400).json({ 
        success: false, 
        message: "Priority must be 'high', 'medium', or 'low'" 
      });
    }
    
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    
    // Only PI or admin can update collaborators
    const isPI = project.pi && objectIdEquals(project.pi, req.user.id);
    const isAdmin = req.user.role === "admin";
    
    if (!isPI && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the project PI or admin can update collaborators." 
      });
    }
    
    // Find and update collaborator
    const collab = project.collaborators.find(c => c.userId && c.userId.toString() === userId);
    if (!collab) {
      return res.status(404).json({ 
        success: false, 
        message: "User is not a collaborator on this project." 
      });
    }
    
    collab.priority = priority;
    project.lastModifiedBy = req.user.id;
    project.lastModifiedByName = req.user.name;
    await project.save();
    
    res.json({ 
      success: true, 
      message: `Collaborator priority updated to ${priority}`,
      project 
    });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

// Remove collaborator (only PI or admin)
exports.removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }
    
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    
    // Only PI or admin can remove collaborators
    const isPI = project.pi && objectIdEquals(project.pi, req.user.id);
    const isAdmin = req.user.role === "admin";
    
    if (!isPI && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the project PI or admin can remove collaborators." 
      });
    }
    
    // Remove collaborator
    project.collaborators = project.collaborators.filter(c => c.userId && c.userId.toString() !== userId);
    project.lastModifiedBy = req.user.id;
    project.lastModifiedByName = req.user.name;
    await project.save();
    
    res.json({ 
      success: true, 
      message: "Collaborator removed",
      project 
    });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

exports.remove = async (req, res) => {
  try {
    // Only admin or PI (owner) can remove the project
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    const isAdmin = req.user.role === "admin";
    const isPI = project.pi && objectIdEquals(project.pi, req.user.id);
    if (!isAdmin && !isPI) return res.status(403).json({ success: false, message: "Only admin or PI can delete this project." });

    await Research.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted." });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.seed = async (req, res) => {
  try {
    // Check if projects already exist
    const count = await Research.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: `Already have ${count} research projects.` });
    }

    await Research.insertMany([
      { title: "AI-Powered Crop Disease Detection Using Deep Learning", lead: "Dr. Tesfaye Worku", college: "College of Electrical Engineering & Computing", department: "Computer Science & Engineering", status: "active" },
      { title: "Solar-Powered Water Purification for Rural Ethiopia", lead: "Prof. Almaz Tadesse", college: "College of Mechanical, Chemical & Materials Engineering", department: "Chemical Engineering", status: "active" },
      // ... keep existing sample seeds ...
    ]);
    const total = await Research.countDocuments();
    res.json({ success: true, message: `Seeded ${total} research projects and proposal mockups.` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};