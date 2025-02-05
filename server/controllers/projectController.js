const Project = require('../models/Project');
const SubProject = require('../models/SubProject');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anuskamhzn33@gmail.com', // your email address from environment variables
    pass: 'juge duar pqey uwdm', // your email password or app-specific password from environment variables
  },
});

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, members = [] } = req.body;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User must be logged in.' });
    }

    const owner = req.user.id; // Automatically set owner to logged-in user

    const registeredMembers = [];
    const pendingInvites = [];

    for (const email of members) {
      const user = await User.findOne({ email });

      if (user) {
        registeredMembers.push(user.id); // Store user ID if registered
      } else {
        pendingInvites.push(email); // Store email if not registered
      }
    }

    const newProject = new Project({
      title,
      description,
      owner,
      members: registeredMembers, // Add registered users
      pendingInvites, // Add emails of unregistered users
    });

    await newProject.save();

    // ✅ Send emails to ALL members (registered & unregistered)
    for (const email of members) {
      try {
        await sendInvitationEmail(email, newProject.id);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError.message);
      }
    }

    res.status(201).json({ message: 'Project created successfully and invitations sent!', project: newProject });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// Function to send invitation email
const sendInvitationEmail = async (email, projectId) => {
  try {
    const token = jwt.sign({ email, projectId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Change the approval link to directly hit the backend route
    const approvalLink = `http://localhost:5000/api/project/approve-invite?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Project Invitation - Approve Your Invitation',
      html: `
        <p>You have been invited to join a project.</p>
        <p>Click the button below to approve your invitation:</p>
        <a href="${approvalLink}" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Approve Invitation
        </a>
        <p>If you are not registered, you will be directed to the login/register page.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending invitation email:', error);
  }
};


// Approve invitation
exports.approveInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Invalid token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, projectId } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      // If user is not registered, redirect to the login page
      return res.redirect(`${process.env.FRONTEND_URL}/register?redirect=approve-invite&token=${token}`);
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // If the user is not in the members list, add them and remove from pendingInvites
    if (!project.members.includes(user._id)) {
      project.members.push(user._id);
      project.pendingInvites = project.pendingInvites.filter(e => e !== email); // Remove from pendingInvites
      await project.save();
    }

    // Redirect to the login page after the user has been added to the project
    res.redirect(`${process.env.FRONTEND_URL}/login`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving invitation', error });
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

    if (!projects || projects.length === 0) {
      return res.status(200).json([]);  // Return empty array if no projects found
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

//Create Sub Project by owner
exports.createSubProject = async (req, res) => {
  try {
    const { mainProjectId } = req.params;
    const { title, description, dueDate, status, members } = req.body;

    // Validate input
    if (!title || !description || !dueDate || !Array.isArray(members)) {
      return res.status(400).json({ message: "Title, description, due date, and members are required." });
    }

    // Check if main project exists
    const mainProject = await Project.findById(mainProjectId);
    if (!mainProject) {
      return res.status(404).json({ message: "Main project not found." });
    }

    // Check if the logged-in user is the owner of the main project
    if (!req.user || req.user.id.toString() !== mainProject.owner.toString()) {
      return res.status(403).json({ message: "Only the owner can create a sub-project." });
    }

    // Ensure status is valid
    const validStatuses = ["To Do", "In Progress", "Completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Validate members: Ensure that emails are valid and belong to users who are part of the main project
    const memberIds = [];

    for (const email of members) {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: `User with email ${email} not found.` });
      }

      // Ensure that the user is part of the main project members
      if (!mainProject.members.includes(user._id.toString())) {
        return res.status(400).json({ message: `User with email ${email} is not part of the main project.` });
      }

      // Add the user's ID to the memberIds array
      memberIds.push(user._id.toString());
    }

    // Create the sub-project with the assigned members
    const newSubProject = new SubProject({
      title,
      description,
      dueDate,
      status: status || "To Do", // Default to "To Do" if not provided
      mainProject: mainProjectId,
      owner: req.user.id,
      members: memberIds, // Assign members by their IDs
    });

    await newSubProject.save();

    // Optionally, you could add the new sub-project ID to the main project's list of sub-projects here

    res.status(201).json({
      message: "Sub-project created successfully!",
      subProject: newSubProject,
    });
  } catch (error) {
    console.error("Error creating sub-project:", error);
    res.status(500).json({ message: "Error creating sub-project", error: error.message });
  }
};

// Get all the sub-projects for owner and members of the main project
exports.getSubProjectsByMainProject = async (req, res) => {
  try {
    const { mainProjectId } = req.params;
    const userId = req.user.id;

    // Validate the project ID format
    if (!mongoose.Types.ObjectId.isValid(mainProjectId)) {
      return res.status(400).json({ message: "Invalid project ID format." });
    }

    // Find the main project to ensure the user is either the owner or a member
    const mainProject = await Project.findById(mainProjectId);

    if (!mainProject) {
      return res.status(404).json({ message: "Main project not found" });
    }

    // Ensure the user is either the owner or a member of the main project
    if (mainProject.owner.toString() !== userId && !mainProject.members.includes(userId)) {
      return res.status(403).json({ message: "Access denied. You are not a member of this project." });
    }

    // Fetch all sub-projects related to the main project
    const subProjects = await SubProject.find({
      mainProject: new mongoose.Types.ObjectId(mainProjectId),
    });

    // Filter sub-projects by owner or member status
    const accessibleSubProjects = subProjects.filter(subProject => {
      return subProject.owner.toString() === userId || subProject.members.some(member => member.toString() === userId);
    });

    // If no accessible sub-projects are found
    if (accessibleSubProjects.length === 0) {
      return res.status(404).json({ message: "No sub-projects found for this main project." });
    }

    // Return the list of accessible sub-projects
    res.status(200).json({ subProjects: accessibleSubProjects });
  } catch (error) {
    console.error("Error fetching sub-projects:", error);
    res.status(500).json({ message: "Error fetching sub-projects", error: error.message });
  }
};

// Update sub-project status
exports.updateSubProjectStatus = async (req, res) => {
  try {
    const { subProjectId, status } = req.body;

    // Ensure the status is valid
    const validStatuses = ["To Do", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find the sub-project by ID
    const subProject = await SubProject.findById(subProjectId);
    if (!subProject) {
      return res.status(404).json({ message: "Sub-project not found" });
    }

    // Check if the logged-in user is a member of the sub-project
    if (!subProject.members.includes(req.user.id.toString())) {
      return res.status(403).json({ message: "Only assigned members can update the status." });
    }

    // Update the sub-project status
    subProject.status = status;

    // Save the updated sub-project
    const updatedSubProject = await subProject.save();

    res.status(200).json({
      message: "Sub-project status updated successfully!",
      subProject: updatedSubProject,
    });
  } catch (error) {
    console.error("Error updating sub-project status:", error);
    res.status(500).json({ message: "Error updating sub-project status", error: error.message });
  }
};
