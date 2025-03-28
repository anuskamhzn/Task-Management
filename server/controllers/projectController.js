const Project = require('../models/Project');
const SubProject = require('../models/SubProject');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, members = [], dueDate } = req.body;

    // Validate input
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'Title, description, and due date are required.' });
    }

    // Ensure the dueDate is a valid date
    if (isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: 'Invalid due date.' });
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
      dueDate,
      pendingInvites, // Add emails of unregistered users
    });

    await newProject.save();

    // Send emails to ALL members (registered & unregistered)
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

// exports.createProject = async (req, res) => {
//   try {
//     const { title, description, members = [] } = req.body;

//     if (!title || !description) {
//       return res.status(400).json({ message: 'Title and description are required.' });
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: User must be logged in.' });
//     }

//     const owner = req.user.id;

//     // All users (registered or not) must accept invitation first
//     const pendingInvites = [...members]; // Store all as pending invites
//     const newProject = new Project({
//       title,
//       description,
//       owner,
//       members: [], // No members initially
//       pendingInvites, // Everyone starts as pending
//     });

//     await newProject.save();

//     // ✅ Send invitation email to all members (registered & unregistered)
//     for (const email of members) {
//       try {
//         await sendInvitationEmail(email, newProject.id);
//       } catch (emailError) {
//         console.error(`Failed to send email to ${email}:`, emailError.message);
//       }
//     }

//     res.status(201).json({
//       message: 'Project created successfully. Invitations sent!',
//       project: newProject,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating project', error: error.message });
//   }
// };


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
    const userId = req.user.id;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ],
      deletedAt: null // Mandatory filter outside $or
    }).populate('owner members');

    if (!projects || projects.length === 0) {
      return res.status(200).json([]);
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

// Permanent delete a project by the owner and set `deletedAt` field
exports.deleteProjectPermanent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    // Check if the project exists and belongs to the logged-in user (owner)
    const project = await Project.findOne({ _id: projectId, owner: ownerId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete it.' });
    }

    await project.deleteOne();

    // Soft delete associated sub-projects
    await SubProject.deleteMany(
      { mainProject: projectId }
    );

    res.status(200).json({ message: 'Project and associated sub-projects moved to trash successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting project', error: error.message });
  }
};

// Soft delete a project by the owner and set `deletedAt` field
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    // Check if the project exists and belongs to the logged-in user (owner)
    const project = await Project.findOne({ _id: projectId, owner: ownerId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete it.' });
    }

    // Soft delete the project by setting deletedAt
    project.deletedAt = new Date();
    await project.save();

    // Soft delete associated sub-projects
    await SubProject.updateMany(
      { mainProject: projectId },
      { deletedAt: new Date() }
    );

    res.status(200).json({ message: 'Project and associated sub-projects moved to trash successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting project', error: error.message });
  }
};

// Get all deleted projects
exports.getAllDeletedProjects = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you're using user authentication

    const projects = await Project.find({
      deletedAt: { $ne: null },  // Ensure it's a deleted project
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).populate('owner members');

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching deleted projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};
// Restore a soft-deleted project and its associated sub-projects
exports.restoreProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    // Find the project that is soft-deleted
    const project = await Project.findOne({ _id: projectId, owner: ownerId, deletedAt: { $ne: null } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or it is not in trash.' });
    }

    // Restore the project by clearing the `deletedAt` field
    project.deletedAt = null;
    await project.save();

    // Restore associated sub-projects by clearing the `deletedAt` field for each
    await SubProject.updateMany(
      { mainProject: projectId, deletedAt: { $ne: null } },
      { deletedAt: null }
    );

    res.status(200).json({ message: 'Project and associated sub-projects restored successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring project', error: error.message });
  }
};

// Update a project (by owner or member)
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, members } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== userId && !project.members.some(id => id.toString() === userId)) {
      return res.status(403).json({ message: "You do not have permission to update this project" });
    }

    let newMembers = [];
    let newPendingInvites = [];
    let removedMembers = [];

    if (title) project.title = title;
    if (description) project.description = description;
    if (dueDate) {
      if (isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ message: "Invalid due date" });
      }
      project.dueDate = dueDate;
    }

    if (members !== undefined) {
      for (const email of members) {
        const user = await User.findOne({ email });
        if (user) {
          if (!project.members.some(id => id.toString() === user.id)) {
            newMembers.push(user.id);
          }
        } else {
          if (!project.pendingInvites.includes(email)) {
            newPendingInvites.push(email);
          }
        }
      }

      for (const memberId of project.members) {
        const member = await User.findById(memberId);
        if (member && !members.includes(member.email)) {
          removedMembers.push(memberId.toString());
        }
      }

      const updatedPendingInvites = project.pendingInvites.filter(email => members.includes(email));
      project.members = project.members.filter(id => !removedMembers.includes(id.toString()));
      project.members = [...new Set([...project.members, ...newMembers])];
      project.pendingInvites = [...new Set([...updatedPendingInvites, ...newPendingInvites])];
    }

    await project.save();

    // Update sub-projects when members are removed
    if (removedMembers.length > 0) {
      const subProjects = await SubProject.find({ mainProject: projectId, deletedAt: null });
      for (const subProject of subProjects) {
        const initialMembersLength = subProject.members.length;
        subProject.members = subProject.members.filter(id => !removedMembers.includes(id.toString()));
        if (subProject.members.length !== initialMembersLength) {
          await subProject.save();
        }
      }
    }

    for (const email of newPendingInvites) {
      try {
        await sendInvitationEmail(email, projectId);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError.message);
      }
    }

    res.status(200).json({
      message: "Project updated successfully",
      project,
      removedMembers,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project", error: error.message });
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

    // Add the new subproject to the parent project's subProjects array
    mainProject.subProjects.push(newSubProject._id);
    await mainProject.save();

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
      deletedAt: null,
    }).populate('members','name email username');

    // Filter sub-projects by whether the user is a member of the main project or is the owner
    const accessibleSubProjects = subProjects.filter(subProject => {
      return subProject.owner.toString() === userId || mainProject.members.some(member => member.toString() === userId);
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

// permanent delete a sub-project under a main project
exports.deleteSubProjectPermanent = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params; // Get both mainProjectId, subProjectId
    const ownerId = req.user.id;  // Get the authenticated user's ID

    // Check if the sub-project exists and belongs to the main project
    const subProject = await SubProject.findOne({ _id: subProjectId, mainProject: mainProjectId });

    if (!subProject) {
      return res.status(404).json({ message: 'Sub-project not found or does not belong to the main project' });
    }

    // Check if the logged-in user is the owner of the main project or a member of the sub-project
    if (subProject.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You do not have permission to delete this sub-project' });
    }

    await subProject.deleteOne();

    res.status(200).json({ message: 'Sub-project deleted successfully', subProject });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting sub-project', error: error.message });
  }
};

// Soft delete a sub-project under a main project
exports.deleteSubProject = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params; // Get both mainProjectId, subProjectId
    const ownerId = req.user.id;  // Get the authenticated user's ID

    // Check if the sub-project exists and belongs to the main project
    const subProject = await SubProject.findOne({ _id: subProjectId, mainProject: mainProjectId });

    if (!subProject) {
      return res.status(404).json({ message: 'Sub-project not found or does not belong to the main project' });
    }

    // Check if the logged-in user is the owner of the main project or a member of the sub-project
    if (subProject.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You do not have permission to delete this sub-project' });
    }

    // Soft delete the sub-project by setting `deletedAt`
    subProject.deletedAt = new Date();
    await subProject.save();

    res.status(200).json({ message: 'Sub-project moved to trash successfully', subProject });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting sub-project', error: error.message });
  }
};

// Get all deleted subproject for a specific main task
exports.getDeletedSubProjects = async (req, res) => {
  try {
    const { mainProjectId } = req.params;
    const ownerId = req.user.id; // Assuming you're using user authentication
    
    const deletedSubProjects = await SubProject.find({
      owner: ownerId,
      mainProject: mainProjectId,
      deletedAt: { $ne: null }, // Fetch subtasks where deletedAt is not null (soft-deleted)
    });

    if (deletedSubProjects.length === 0) {
      return res.status(200).json([]); // Return an empty array if no deleted subtasks are found
    }
    res.status(200).json(deletedSubProjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deleted subprojects', error: error.message });
  }
};

// Restore a soft-deleted sub-project
exports.restoreSubProject = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params;
    const ownerId = req.user.id;

    // Find the sub-project
    const subProject = await SubProject.findOne({ _id: subProjectId, mainProject: mainProjectId });

    if (!subProject) {
      return res.status(404).json({ message: 'Sub-project not found or does not belong to the main project' });
    }

    // Check if the logged-in user is the owner of the main project or a member of the sub-project
    if (subProject.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You do not have permission to restore this sub-project' });
    }

    // Restore the sub-project by clearing the `deletedAt` field
    subProject.deletedAt = null;
    await subProject.save();

    res.status(200).json({ message: 'Sub-project restored successfully', subProject });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring sub-project', error: error.message });
  }
};

// Update a sub-project under a main project
exports.updateSubProject = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params;
    const { title, description, dueDate, status, addMembers, removeMembers } = req.body; // Use addMembers and removeMembers instead of members
    const userId = req.user.id; // The logged-in user's ID

    // Find the sub-project
    const subProject = await SubProject.findOne({
      _id: subProjectId,
      mainProject: mainProjectId,
    });

    if (!subProject) {
      return res.status(404).json({ message: "Sub-project not found or does not belong to the main project" });
    }

    // Check if the logged-in user is the owner or a member of the sub-project
    if (subProject.owner.toString() !== userId && !subProject.members.some(id => id.toString() === userId)) {
      return res.status(403).json({ message: "You do not have permission to update this sub-project" });
    }

    // Find the main project to validate members
    const mainProject = await Project.findById(mainProjectId);
    if (!mainProject) {
      return res.status(404).json({ message: "Main project not found" });
    }

    // Update basic sub-project fields if provided
    if (title) subProject.title = title;
    if (description) subProject.description = description;
    if (dueDate) {
      if (isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ message: "Invalid due date" });
      }
      subProject.dueDate = dueDate;
    }
    if (status) {
      const validStatuses = ["To Do", "In Progress", "Completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      subProject.status = status;
    }

    // Get the current main project members' IDs as strings
    const mainProjectMemberIds = mainProject.members.map(id => id.toString());

    // Process adding members if provided
    if (Array.isArray(addMembers) && addMembers.length > 0) {
      const newMemberIds = [];
      for (const email of addMembers) {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: `User with email ${email} not found` });
        }
        const userIdStr = user._id.toString();
        if (!mainProjectMemberIds.includes(userIdStr)) {
          return res.status(400).json({
            message: `User with email ${email} is not a member of the main project`,
          });
        }
        if (!subProject.members.some(id => id.toString() === userIdStr)) {
          newMemberIds.push(userIdStr); // Only add if not already in sub-project
        }
      }
      // Add new members to the existing array
      subProject.members = [...new Set([...subProject.members.map(id => id.toString()), ...newMemberIds])];
    }

    // Process removing members if provided
    if (Array.isArray(removeMembers) && removeMembers.length > 0) {
      const memberIdsToRemove = [];
      for (const email of removeMembers) {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: `User with email ${email} not found` });
        }
        const userIdStr = user._id.toString();
        if (subProject.members.some(id => id.toString() === userIdStr)) {
          memberIdsToRemove.push(userIdStr); // Only remove if currently in sub-project
        }
      }
      // Remove specified members from the existing array
      subProject.members = subProject.members.filter(id => !memberIdsToRemove.includes(id.toString()));
    }

    // Save the updated sub-project
    await subProject.save();

    res.status(200).json({
      message: "Sub-project updated successfully",
      subProject,
    });
  } catch (error) {
    console.error("Error updating sub-project:", error);
    res.status(500).json({ message: "Error updating sub-project", error: error.message });
  }
};
exports.getSubProjectById = async (req, res) => {
  const { mainProjectId, subProjectId } = req.params;

  try {
        const mainTask = await Project.findById(mainProjectId);
        if (!mainTask) {
          return res.status(404).json({ message: "Main task not found" });
        }
    // Fetch the subproject and populate the referenced fields (mainProject, owner, members)
    const subproject = await SubProject.findById(subProjectId)
      .populate('mainProject')  // Populating the mainProject reference (Project model)
      .populate('owner')        // Populating the owner reference (User model)
      .populate('members');     // Populating the members array (User model)

    if (!subproject) {
      return res.status(404).json({ message: "Subproject not found" });
    }

    // Return the populated subproject
    res.json(subproject);
  } catch (error) {
    console.error("Error fetching subproject:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific project by ID with member details
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Validate the project ID format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format." });
    }

    // Find the project where the user is either the owner or a member
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: userId }, { members: userId }],
      deletedAt: null, // Exclude deleted projects
    })
      .populate('owner', 'name email username') // Populate owner with specific fields
      .populate('members', 'name email username'); // Populate members with specific fields

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you do not have access to it.",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
};

// Get sub-projects by parent project ID
// exports.getSubProjectById = async (req, res) => {
//   const { mainProjectId, subProjectId } = req.params;

//   try {
//     // Verify the main project exists
//     const mainTask = await Project.findById(mainProjectId);
//     if (!mainTask) {
//       return res.status(404).json({ message: "Main task not found" });
//     }

//     // Fetch the sub-project and populate the referenced fields
//     const subproject = await SubProject.findById(subProjectId)
//       .populate('mainProject')  // Populating the mainProject reference (Project model)
//       .populate('owner')        // Populating the owner reference (User model)
//       .populate('members');     // Populating the members array (User model)

//     if (!subproject) {
//       return res.status(404).json({ message: "Subproject not found" });
//     }

//     // Return the populated sub-project
//     res.json(subproject);
//   } catch (error) {
//     console.error("Error fetching subproject:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };