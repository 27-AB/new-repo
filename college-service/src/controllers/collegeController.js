// college-service/src/controllers/collegeController.js
const { College, Researcher } = require("../models/College");

// -------------------- Helpers --------------------
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const normalizeEmail = (email) => (email ? String(email).trim().toLowerCase() : "");

// -------------------- Colleges --------------------

// GET /colleges/
exports.getAll = async (req, res) => {
  try {
    console.log("Fetching all colleges...");
    const colleges = await College.find().sort({ name: 1 });
    console.log(`Found ${colleges.length} colleges.`);
    res.json({ success: true, total: colleges.length, colleges });
  } catch (err) {
    console.error("CRITICAL ERROR IN GET ALL:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /colleges/:id
exports.getOne = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, college });
  } catch (err) {
    console.error("getOne error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /colleges/
exports.create = async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json({ success: true, college });
  } catch (err) {
    console.error("create college error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /colleges/:id
exports.update = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!college) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, college });
  } catch (err) {
    console.error("update college error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /colleges/:id
exports.remove = async (req, res) => {
  try {
    const c = await College.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, message: "College deleted" });
  } catch (err) {
    console.error("remove college error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Researchers --------------------

// GET /colleges/researchers
exports.getResearchers = async (req, res) => {
  try {
    const { college, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (college) query.college = new RegExp(college, "i");
    if (search) query.$or = [{ name: new RegExp(search, "i") }, { specialization: new RegExp(search, "i") }];

    const researchers = await Researcher.find(query)
      .sort({ publications: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Researcher.countDocuments(query);
    res.json({ success: true, total, researchers });
  } catch (err) {
    console.error("getResearchers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a researcher (POST /colleges/researchers)
exports.createResearcher = async (req, res) => {
  try {
    const payload = {
      name: (req.body.name || "").trim(),
      title: req.body.title || "Dr.",
      college: req.body.college || "",
      department: req.body.department || "",
      email: normalizeEmail(req.body.email || ""),
      specialization: Array.isArray(req.body.specialization)
        ? req.body.specialization
        : (req.body.specialization ? String(req.body.specialization).split(",").map(s => s.trim()).filter(Boolean) : []),
      publications: Number(req.body.publications) || 0,
      activeProjects: Number(req.body.activeProjects) || 0,
      bio: req.body.bio || ""
    };

    if (!payload.name) return res.status(400).json({ success: false, message: "Name is required" });
    if (!payload.email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!isValidEmail(payload.email)) return res.status(400).json({ success: false, message: "Invalid email" });

    // Prevent duplicate emails
    const existing = await Researcher.findOne({ email: payload.email });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered" });

    const researcher = await Researcher.create(payload);
    res.status(201).json({ success: true, researcher });
  } catch (err) {
    console.error("createResearcher error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /colleges/researchers/:id
exports.getResearcher = async (req, res) => {
  try {
    const r = await Researcher.findById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Researcher not found" });
    res.json({ success: true, researcher: r });
  } catch (err) {
    console.error("getResearcher error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /colleges/researchers/:id
exports.updateResearcher = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.email) {
      updates.email = normalizeEmail(updates.email);
      if (!isValidEmail(updates.email)) return res.status(400).json({ success: false, message: "Invalid email" });

      // ensure email isn't taken by another researcher
      const conflict = await Researcher.findOne({ email: updates.email, _id: { $ne: req.params.id } });
      if (conflict) return res.status(409).json({ success: false, message: "Email already registered by another researcher" });
    }

    // normalize specialization if provided as comma string
    if (updates.specialization && !Array.isArray(updates.specialization)) {
      updates.specialization = String(updates.specialization).split(",").map(s => s.trim()).filter(Boolean);
    }

    const r = await Researcher.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!r) return res.status(404).json({ success: false, message: "Researcher not found" });
    res.json({ success: true, researcher: r });
  } catch (err) {
    console.error("updateResearcher error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /colleges/researchers/:id
exports.removeResearcherById = async (req, res) => {
  try {
    const r = await Researcher.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Researcher not found" });
    res.json({ success: true, message: "Researcher deleted" });
  } catch (err) {
    console.error("removeResearcherById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Seed --------------------
// Seeds colleges and a few researchers. Safe to call on dev; avoid on production.
exports.seed = async (req, res) => {
  try {
    console.log("Starting seed process...");
    await College.deleteMany({});
    await Researcher.deleteMany({});

    const seededColleges = await College.insertMany([
      {
        name: "College of Electrical Engineering & Computing",
        shortName: "CEEC",
        dean: "Prof. Girma Tesfaye",
        established: 1993,
        color: "#3b82f6",
        departments: [
          "Computer Science & Engineering",
          "Electrical & Computer Engineering",
          "Software Engineering",
          "Information Technology",
          "Computer Networks"
        ],
        description: "The largest college at ASTU, leading research and education in computing, software, and electrical systems."
      },
      {
        name: "College of Mechanical, Chemical & Materials Engineering",
        shortName: "CMCME",
        dean: "Prof. Almaz Tadesse",
        established: 1994,
        color: "#f59e0b",
        departments: ["Mechanical Engineering", "Chemical Engineering", "Materials Science & Engineering"],
        description: "Advancing engineering solutions in manufacturing and industrial processes."
      },
      {
        name: "College of Civil Engineering and Architecture",
        shortName: "CCEA",
        dean: "Dr. Biruk Hailu",
        established: 1995,
        color: "#10b981",
        departments: ["Civil Engineering", "Architecture", "Urban & Regional Planning"],
        description: "Building Ethiopia's future through excellence in infrastructure design."
      },
      {
        name: "College of Applied Natural Science",
        shortName: "CANS",
        dean: "Prof. Mekdes Bekele",
        established: 1996,
        color: "#8b5cf6",
        departments: ["Mathematics", "Physics", "Chemistry", "Biology & Biotechnology"],
        description: "Providing foundational and applied science education supporting research."
      }
    ]);

    const seededResearchers = await Researcher.insertMany([
      {
        name: "Dr. Tesfaye Worku",
        title: "Dr.",
        college: "College of Electrical Engineering & Computing",
        department: "Computer Science & Engineering",
        email: "tesfaye.worku@astu.edu.et",
        specialization: ["Distributed Systems", "Edge Computing"],
        publications: 18,
        activeProjects: 3,
        bio: "Researcher in distributed and edge systems."
      },
      {
        name: "Prof. Almaz Tadesse",
        title: "Prof.",
        college: "College of Mechanical, Chemical & Materials Engineering",
        department: "Chemical Engineering",
        email: "almaz.tadesse@astu.edu.et",
        specialization: ["Process Engineering", "Catalysis"],
        publications: 32,
        activeProjects: 4,
        bio: "Focus on catalysis and process design."
      },
      {
        name: "Dr. Bekele Alemu",
        title: "Dr.",
        college: "College of Civil Engineering and Architecture",
        department: "Civil Engineering",
        email: "bekele.alemu@astu.edu.et",
        specialization: ["Hydrology", "Urban Water Systems"],
        publications: 12,
        activeProjects: 2,
        bio: "Works on water quality and urban hydrology."
      }
    ]);

    console.log(`Seed successful: ${seededColleges.length} colleges, ${seededResearchers.length} researchers.`);
    res.json({
      success: true,
      message: "Colleges and researchers seeded successfully.",
      colleges: seededColleges.length,
      researchers: seededResearchers.length
    });
  } catch (err) {
    console.error("SEED ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
