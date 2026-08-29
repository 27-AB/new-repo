const { College, Researcher } = require("../models/College");

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

// GET /colleges/researchers
exports.getResearchers = async (req, res) => {
  try {
    const { college, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (college) query.college = new RegExp(college, "i");
    if (search)  query.$or = [{ name: new RegExp(search, "i") }, { specialization: new RegExp(search, "i") }];
    
    const researchers = await Researcher.find(query)
      .sort({ publications: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({ success: true, total: researchers.length, researchers });
  } catch (err) { 
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
    res.status(500).json({ success: false, message: err.message }); 
  }
};

// POST /colleges/
exports.create = async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json({ success: true, college });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

// PUT /colleges/:id
exports.update = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, college });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

// DELETE /colleges/:id
exports.remove = async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "College deleted" });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};
// Create a researcher (POST /researchers)
exports.createResearcher = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      title: req.body.title || "Dr.",
      college: req.body.college || "",
      department: req.body.department || "",
      email: req.body.email || "",
      specialization: req.body.specialization || [],
      publications: Number(req.body.publications) || 0,
      activeProjects: Number(req.body.activeProjects) || 0,
      bio: req.body.bio || ""
    };
    const researcher = await Researcher.create(payload);
    res.status(201).json({ success: true, researcher });
  } catch (err) {
    console.error("createResearcher error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getResearcher = async (req, res) => {
  try {
    const r = await Researcher.findById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Researcher not found" });
    res.json({ success: true, researcher: r });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateResearcher = async (req, res) => {
  try {
    const r = await Researcher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, researcher: r });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeResearcherById = async (req, res) => {
  try {
    await Researcher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Researcher deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SEED DATA
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
        departments: ["Computer Science & Engineering", "Electrical & Computer Engineering", "Software Engineering", "Information Technology", "Computer Networks"],
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

    await Researcher.insertMany([
      { name: "Dr. Tesfaye Worku", title: "Dr.", college: "College of Electrical Engineering & Computing", department: "Computer Science & Engineering", email: "tesfaye.worku@astu.edu.et", publications: 18 },
      { name: "Prof. Almaz Tadesse", title: "Prof.", college: "College of Mechanical, Chemical & Materials Engineering", department: "Chemical Engineering", email: "almaz.tadesse@astu.edu.et", publications: 32 }
    ]);

    console.log("Seed successful!");
    res.json({ success: true, message: "Colleges and researchers seeded successfully.", count: seededColleges.length });
  } catch (err) { 
    console.error("SEED ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message }); 
  }
};
