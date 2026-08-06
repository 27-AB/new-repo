const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/astu-analytics';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Milestone schemas for each service
const ResearchMilestoneSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Research', required: true },
  title: { type: String, required: true },
  customTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  completionDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignedTo: { type: String, default: '' },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
  resourcesNeeded: { type: String, default: '' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CommunityMilestoneSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  title: { type: String, required: true },
  customTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  completionDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignedTo: { type: String, default: '' },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
  resourcesNeeded: { type: String, default: '' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CollegeMilestoneSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  title: { type: String, required: true },
  customTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  completionDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignedTo: { type: String, default: '' },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
  resourcesNeeded: { type: String, default: '' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models using specific database connections
const ResearchMilestone = mongoose.model('Milestone', ResearchMilestoneSchema, 'research_milestones');
const CommunityMilestone = mongoose.model('Milestone', CommunityMilestoneSchema, 'community_milestones');
const CollegeMilestone = mongoose.model('Milestone', CollegeMilestoneSchema, 'college_milestones');

// Research Project Schema
const ResearchSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  endDate: Date,
  status: String
});
const Research = mongoose.model('Research', ResearchSchema, 'researches');

// Community Project Schema
const CommunitySchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  endDate: Date,
  status: String
});
const Community = mongoose.model('Community', CommunitySchema, 'communities');

// College Schema
const CollegeSchema = new mongoose.Schema({
  name: String,
  established: Date
});
const College = mongoose.model('College', CollegeSchema, 'colleges');

// Helper function to generate milestones based on project dates
function generateMilestones(project, entityType) {
  const startDate = new Date(project.startDate || project.established || new Date());
  const endDate = new Date(project.endDate || new Date().setFullYear(new Date().getFullYear() + 1));
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // days
  
  const milestones = [];
  
  // Calculate milestone dates based on project duration
  const firstQuarter = new Date(startDate);
  firstQuarter.setDate(firstQuarter.getDate() + Math.floor(duration * 0.25));
  
  const midTerm = new Date(startDate);
  midTerm.setDate(midTerm.getDate() + Math.floor(duration * 0.5));
  
  const phase1End = new Date(startDate);
  phase1End.setDate(phase1End.getDate() + Math.floor(duration * 0.6));
  
  const phase2End = new Date(startDate);
  phase2End.setDate(phase2End.getDate() + Math.floor(duration * 0.8));
  
  const finalTest = new Date(endDate);
  finalTest.setDate(finalTest.getDate() - 30); // 30 days before end
  
  // Standard milestones for all projects
  milestones.push({
    projectId: project._id,
    title: 'First Quarter Report',
    description: 'Initial progress report and findings summary',
    dueDate: firstQuarter,
    status: Math.random() > 0.5 ? 'completed' : 'in-progress',
    priority: 'medium',
    assignedTo: 'Project Lead',
    progress: Math.random() > 0.5 ? 100 : Math.floor(Math.random() * 75) + 25,
    completionDate: Math.random() > 0.5 ? new Date(firstQuarter.getTime() - 7 * 24 * 60 * 60 * 1000) : null
  });
  
  milestones.push({
    projectId: project._id,
    title: 'Mid-term Review',
    description: 'Comprehensive review of project progress and adjustments',
    dueDate: midTerm,
    status: Math.random() > 0.7 ? 'in-progress' : 'pending',
    priority: 'high',
    assignedTo: 'Research Team',
    progress: Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0,
    completionDate: null
  });
  
  milestones.push({
    projectId: project._id,
    title: 'Phase 1 Completion',
    description: 'Completion of first major phase with deliverables',
    dueDate: phase1End,
    status: Math.random() > 0.8 ? 'completed' : 'in-progress',
    priority: 'high',
    assignedTo: 'Project Lead',
    progress: Math.random() > 0.8 ? 100 : Math.floor(Math.random() * 60) + 40,
    completionDate: Math.random() > 0.8 ? new Date(phase1End.getTime() - 5 * 24 * 60 * 60 * 1000) : null
  });
  
  milestones.push({
    projectId: project._id,
    title: 'Phase 2 Completion',
    description: 'Completion of second major phase with testing',
    dueDate: phase2End,
    status: Math.random() > 0.9 ? 'in-progress' : 'pending',
    priority: 'high',
    assignedTo: 'Technical Team',
    progress: Math.random() > 0.9 ? Math.floor(Math.random() * 30) : 0,
    completionDate: null
  });
  
  milestones.push({
    projectId: project._id,
    title: 'Final Lab Test',
    description: 'Final laboratory testing and validation',
    dueDate: finalTest,
    status: Math.random() > 0.95 ? 'pending' : 'pending',
    priority: 'critical',
    assignedTo: 'Quality Assurance',
    progress: 0,
    completionDate: null
  });
  
  milestones.push({
    projectId: project._id,
    title: 'Documentation',
    description: 'Final documentation and reporting',
    dueDate: endDate,
    status: 'pending',
    priority: 'medium',
    assignedTo: 'Project Lead',
    progress: 0,
    completionDate: null
  });
  
  return milestones;
}

// Seed milestones for all entities
async function seedMilestones() {
  try {
    console.log('Starting milestone seeding...');
    
    // Clear existing milestones
    await ResearchMilestone.deleteMany({});
    await CommunityMilestone.deleteMany({});
    await CollegeMilestone.deleteMany({});
    console.log('Cleared existing milestones');
    
    // Get all research projects
    const researchProjects = await Research.find({});
    console.log(`Found ${researchProjects.length} research projects`);
    
    // Seed research milestones
    for (const project of researchProjects) {
      const milestones = generateMilestones(project, 'research');
      await ResearchMilestone.insertMany(milestones);
      console.log(`Added ${milestones.length} milestones for research project: ${project.title}`);
    }
    
    // Get all community projects
    const communityProjects = await Community.find({});
    console.log(`Found ${communityProjects.length} community projects`);
    
    // Seed community milestones
    for (const project of communityProjects) {
      const milestones = generateMilestones(project, 'community');
      await CommunityMilestone.insertMany(milestones);
      console.log(`Added ${milestones.length} milestones for community project: ${project.title}`);
    }
    
    // Get all colleges
    const colleges = await College.find({});
    console.log(`Found ${colleges.length} colleges`);
    
    // Seed college milestones (fewer, more strategic)
    for (const college of colleges) {
      const startDate = new Date(college.established || new Date('2020-01-01'));
      const currentYear = new Date().getFullYear();
      
      const collegeMilestones = [
        {
          projectId: college._id,
          title: 'Annual Strategic Review',
          description: 'Annual review of college strategic goals and achievements',
          dueDate: new Date(currentYear, 5, 30), // June 30
          status: Math.random() > 0.5 ? 'completed' : 'in-progress',
          priority: 'high',
          assignedTo: 'College Dean',
          progress: Math.random() > 0.5 ? 100 : Math.floor(Math.random() * 75) + 25,
          completionDate: Math.random() > 0.5 ? new Date(currentYear, 5, 15) : null
        },
        {
          projectId: college._id,
          title: 'Budget Planning',
          description: 'Annual budget planning and resource allocation',
          dueDate: new Date(currentYear, 2, 31), // March 31
          status: 'completed',
          priority: 'critical',
          assignedTo: 'Finance Committee',
          progress: 100,
          completionDate: new Date(currentYear, 2, 15)
        },
        {
          projectId: college._id,
          title: 'Faculty Development Program',
          description: 'Faculty training and development initiatives',
          dueDate: new Date(currentYear, 11, 31), // December 31
          status: 'in-progress',
          priority: 'medium',
          assignedTo: 'HR Department',
          progress: Math.floor(Math.random() * 60) + 20,
          completionDate: null
        },
        {
          projectId: college._id,
          title: 'Infrastructure Assessment',
          description: 'Assessment of college infrastructure and facilities',
          dueDate: new Date(currentYear, 8, 30), // September 30
          status: 'pending',
          priority: 'medium',
          assignedTo: 'Facilities Management',
          progress: 0,
          completionDate: null
        }
      ];
      
      await CollegeMilestone.insertMany(collegeMilestones);
      console.log(`Added ${collegeMilestones.length} milestones for college: ${college.name}`);
    }
    
    console.log('✅ Milestone seeding completed successfully!');
    
    // Print statistics
    const researchCount = await ResearchMilestone.countDocuments();
    const communityCount = await CommunityMilestone.countDocuments();
    const collegeCount = await CollegeMilestone.countDocuments();
    
    console.log('\n📊 Milestone Statistics:');
    console.log(`Research milestones: ${researchCount}`);
    console.log(`Community milestones: ${communityCount}`);
    console.log(`College milestones: ${collegeCount}`);
    console.log(`Total milestones: ${researchCount + communityCount + collegeCount}`);
    
  } catch (error) {
    console.error('Error seeding milestones:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the seeding
seedMilestones();