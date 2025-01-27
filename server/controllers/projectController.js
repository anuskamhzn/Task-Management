const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, owner, members, status } = req.body;
    
    const newProject = new Project({
      title,
      description,
      owner,
      members,
      status,
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;  // Only use the 'id' from the decoded token
    
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).populate('owner members');

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this user' });
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};


// Update project status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { projectId, status } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project status updated', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project status', error: error.message });
  }
};
