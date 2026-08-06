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

// Use existing Milestone model
const Milestone = require('./src/models/Milestone');
const Research = require('./src/models/Research');

// Helper function to generate milestones based on project dates
function generateMilestones(project) {
  const startDate = new Date(project.startDate || new Date());
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

// Seed milestones for research projects
async function seedMilestones() {
  try {
    console.log('Starting research milestone seeding...');
    
    // Clear existing milestones
    await Milestone.deleteMany({});
    console.log('Cleared existing milestones');
    
    // Get all research projects
    const researchProjects = await Research.find({});
    console.log(`Found ${researchProjects.length} research projects`);
    
    // Seed research milestones
    for (const project of researchProjects) {
      const milestones = generateMilestones(project);
      await Milestone.insertMany(milestones);
      console.log(`Added ${milestones.length} milestones for research project: ${project.title}`);
    }
    
    console.log('✅ Research milestone seeding completed successfully!');
    
    // Print statistics
    const milestoneCount = await Milestone.countDocuments();
    console.log(`\n📊 Total research milestones: ${milestoneCount}`);
    
  } catch (error) {
    console.error('Error seeding milestones:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the seeding
seedMilestones();