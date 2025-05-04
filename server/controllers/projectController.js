const Project = require('../models/Project');
const SubProject = require('../models/SubProject');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const { createNotification } = require('../utils/notificationUtils');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to compute initials from full name
const getInitials = (fullName) => {
  if (!fullName) return '';
  const nameParts = fullName.trim().split(/\s+/);
  const initials = nameParts
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .join('');
  return initials.slice(0, 2);
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, members = [], dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'Title, description, and due date are required.' });
    }

    if (isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: 'Invalid due date.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User must be logged in.' });
    }

    const owner = req.user.id;

    const registeredMembers = [];
    const pendingInvites = [];

    for (const email of members) {
      const user = await User.findOne({ email });
      if (user) {
        registeredMembers.push(user.id);
      } else {
        pendingInvites.push(email);
      }
    }

    const newProject = new Project({
      title,
      description,
      owner,
      members: registeredMembers,
      dueDate,
      pendingInvites,
    });

    await newProject.save();

    // Create a single PROJECT_INVITE notification for all registered members
    if (registeredMembers.length > 0) {
      await createNotification(
        registeredMembers,
        'PROJECT_INVITE',
        `You have been invited to the project "${title}"`,
        newProject._id,
        'Project',
        null,
        req.app.get('io')
      );
    }

    // Create a single DUE_DATE_PROJECT notification for all recipients
    if (dueDate) {
      await createNotification(
        [owner, ...registeredMembers],
        'DUE_DATE_PROJECT',
        `The project "${title}" is created and due on ${new Date(dueDate).toLocaleDateString()}`,
        newProject._id,
        'Project',
        dueDate,
        req.app.get('io')
      );
    }

    // Populate members with full user details
    const populatedProject = await Project.findById(newProject._id)
      .populate('members', 'email name initials')
      .lean();

    for (const email of members) {
      try {
        await sendInvitationEmail(email, newProject.id);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError.message);
      }
    }

    res.status(201).json({
      message: 'Project created successfully and invitations sent!',
      project: {
        ...populatedProject,
        members: populatedProject.members.map(member => ({
          _id: member._id,
          email: member.email,
          name: member.name,
          initials: member.initials || member.name?.slice(0, 2).toUpperCase() || 'U'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// Create a new project
// exports.createProject = async (req, res) => {
//   try {
//     const { title, description, members = [], dueDate } = req.body;

//     if (!title || !description || !dueDate) {
//       return res.status(400).json({ message: 'Title, description, and due date are required.' });
//     }

//     if (isNaN(new Date(dueDate).getTime())) {
//       return res.status(400).json({ message: 'Invalid due date.' });
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: User must be logged in.' });
//     }

//     const owner = req.user.id;

//     const registeredMembers = [];
//     const pendingInvites = [];

//     for (const email of members) {
//       const user = await User.findOne({ email });

//       if (user) {
//         registeredMembers.push(user.id);
//       } else {
//         pendingInvites.push(email);
//       }
//     }

//     const newProject = new Project({
//       title,
//       description,
//       owner,
//       members: registeredMembers,
//       dueDate,
//       pendingInvites,
//     });

//     await newProject.save();

//     for (const email of members) {
//       try {
//         await sendInvitationEmail(email, newProject.id);
//       } catch (emailError) {
//         console.error(`Failed to send email to ${email}:`, emailError.message);
//       }
//     }

//     res.status(201).json({ message: 'Project created successfully and invitations sent!', project: newProject });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating project', error: error.message });
//   }
// };

// Function to send invitation email
const sendInvitationEmail = async (email, projectId) => {
  try {
    const token = jwt.sign({ email, projectId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const approvalLink = `http://localhost:5000/api/project/approve-invite?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Project Invitation - Approve Your Invitation',
      html: `
        <p>You have been invited to join a project.</p>
        <p>Click the button below to approve your invitation:</p>
        <a href="${approvalLink}" style="background-color:#b15bd4;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
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

// projectController.js
exports.approveInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Invalid token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, projectId } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      // Redirect to registration page with email and token as query parameters
      return res.redirect(
        `${process.env.FRONTEND_URL}/register?redirect=approve-invite&token=${token}&email=${encodeURIComponent(email)}`
      );
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.members.includes(user._id)) {
      project.members.push(user._id);
      project.pendingInvites = project.pendingInvites.filter(e => e !== email);
      await project.save();
    }

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
      deletedAt: null
    }).populate({
      path: 'owner members',
      select: 'name email initials photo',
      options: {
        transform: (doc) => {
          if (!doc) return null;
          return {
            ...doc,
            initials: doc.initials || getInitials(doc.name),
            photo: doc.photo && doc.photo.data
              ? {
                data: doc.photo.data.toString('base64'),
                contentType: doc.photo.contentType,
              }
              : null,
          };
        },
      },
    }).lean();

    if (!projects || projects.length === 0) {
      return res.status(200).json([]);
    }

    const formattedProjects = projects.map(project => ({
      ...project,
      description: project.description,
      members: project.members
        .filter(member => member != null) // Filter out null members
        .map(member => ({
          ...member,
          initials: member.initials || getInitials(member.name) || 'U'
        }))
    }));

    res.status(200).json(formattedProjects);
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

// Permanent delete a project
exports.deleteProjectPermanent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    const project = await Project.findOne({ _id: projectId, owner: ownerId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete it.' });
    }

    await project.deleteOne();

    await SubProject.deleteMany({ mainProject: projectId });

    res.status(200).json({ message: 'Project and associated sub-projects moved to trash successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting project', error: error.message });
  }
};

// Soft delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    const project = await Project.findOne({ _id: projectId, owner: ownerId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete it.' });
    }

    project.deletedAt = new Date();
    await project.save();

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
    const userId = req.user.id;

    const projects = await Project.find({
      deletedAt: { $ne: null },
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).populate({
      path: 'owner members',
      select: 'name email name initials photo',
      options: {
        transform: (doc) => {
          if (!doc) return null;
          return {
            ...doc.toObject(),
            initials: doc.initials || getInitials(doc.name),
            photo: doc.photo && doc.photo.data
              ? {
                data: doc.photo.data.toString('base64'),
                contentType: doc.photo.contentType,
              }
              : null,
          };
        },
      },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching deleted projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// Restore a soft-deleted project
exports.restoreProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ownerId = req.user.id;

    const project = await Project.findOne({ _id: projectId, owner: ownerId, deletedAt: { $ne: null } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or it is not in trash.' });
    }

    project.deletedAt = null;
    await project.save();

    await SubProject.updateMany(
      { mainProject: projectId, deletedAt: { $ne: null } },
      { deletedAt: null }
    );

    res.status(200).json({ message: 'Project and associated sub-projects restored successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring project', error: error.message });
  }
};

// Update a project
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
    if (description) project.description = description; // Store HTML description from editor
    if (dueDate) {
      if (isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ message: "Invalid due date" });
      }
      project.dueDate = dueDate;
      // Create a single DUE_DATE_PROJECT notification for all recipients
      const recipients = [project.owner, ...project.members];
      await createNotification(
        recipients,
        'DUE_DATE_PROJECT',
        `The project "${project.title}" due date has been updated to ${new Date(dueDate).toLocaleDateString()}`,
        project._id,
        'Project',
        dueDate,
        req.app.get('io')
      );
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

    // Populate members with full user details
    const populatedProject = await Project.findById(projectId)
      .populate('members', 'email name initials')
      .lean();

    res.status(200).json({
      message: "Project updated successfully",
      project: {
        ...populatedProject,
        description, // Ensure raw HTML description is returned
        members: populatedProject.members.map(member => ({
          _id: member._id,
          email: member.email,
          name: member.name,
          initials: member.initials || member.name?.slice(0, 2).toUpperCase() || 'U'
        })),
        removedMembers,
      }
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
};
// Update a project
// exports.updateProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { title, description, dueDate, members } = req.body;
//     const userId = req.user.id;

//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     if (project.owner.toString() !== userId && !project.members.some(id => id.toString() === userId)) {
//       return res.status(403).json({ message: "You do not have permission to update this project" });
//     }

//     let newMembers = [];
//     let newPendingInvites = [];
//     let removedMembers = [];

//     if (title) project.title = title;
//     if (description) project.description = description;
//     if (dueDate) {
//       if (isNaN(new Date(dueDate).getTime())) {
//         return res.status(400).json({ message: "Invalid due date" });
//       }
//       project.dueDate = dueDate;
//     }

//     if (members !== undefined) {
//       for (const email of members) {
//         const user = await User.findOne({ email });
//         if (user) {
//           if (!project.members.some(id => id.toString() === user.id)) {
//             newMembers.push(user.id);
//           }
//         } else {
//           if (!project.pendingInvites.includes(email)) {
//             newPendingInvites.push(email);
//           }
//         }
//       }

//       for (const memberId of project.members) {
//         const member = await User.findById(memberId);
//         if (member && !members.includes(member.email)) {
//           removedMembers.push(memberId.toString());
//         }
//       }

//       const updatedPendingInvites = project.pendingInvites.filter(email => members.includes(email));
//       project.members = project.members.filter(id => !removedMembers.includes(id.toString()));
//       project.members = [...new Set([...project.members, ...newMembers])];
//       project.pendingInvites = [...new Set([...updatedPendingInvites, ...newPendingInvites])];
//     }

//     await project.save();

//     if (removedMembers.length > 0) {
//       const subProjects = await SubProject.find({ mainProject: projectId, deletedAt: null });
//       for (const subProject of subProjects) {
//         const initialMembersLength = subProject.members.length;
//         subProject.members = subProject.members.filter(id => !removedMembers.includes(id.toString()));
//         if (subProject.members.length !== initialMembersLength) {
//           await subProject.save();
//         }
//       }
//     }

//     for (const email of newPendingInvites) {
//       try {
//         await sendInvitationEmail(email, projectId);
//       } catch (emailError) {
//         console.error(`Failed to send email to ${email}:`, emailError.message);
//       }
//     }

//     res.status(200).json({
//       message: "Project updated successfully",
//       project,
//       removedMembers,
//     });
//   } catch (error) {
//     console.error("Error updating project:", error);
//     res.status(500).json({ message: "Error updating project", error: error.message });
//   }
// };

// Create sub-project
exports.createSubProject = async (req, res) => {
  try {
    const { mainProjectId } = req.params;
    const { title, description, dueDate, status, members } = req.body;

    if (!title || !description || !dueDate || !Array.isArray(members)) {
      return res.status(400).json({ message: "Title, description, due date, and members are required." });
    }

    const mainProject = await Project.findById(mainProjectId);
    if (!mainProject) {
      return res.status(404).json({ message: "Main project not found." });
    }

    if (!req.user || req.user.id.toString() !== mainProject.owner.toString()) {
      return res.status(403).json({ message: "Only the owner can create a sub-project." });
    }

    const validStatuses = ["To Do", "In Progress", "Completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const memberIds = [];

    for (const email of members) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: `User with email ${email} not found.` });
      }

      if (!mainProject.members.includes(user._id.toString())) {
        return res.status(400).json({ message: `User with email ${email} is not part of the main project.` });
      }

      memberIds.push(user._id.toString());
    }

    const newSubProject = new SubProject({
      title,
      description, // Store HTML description from editor
      dueDate,
      status: status || "To Do",
      mainProject: mainProjectId,
      owner: req.user.id,
      members: memberIds,
    });

    await newSubProject.save();

    // Populate members with full user details
    const populatedSubProject = await SubProject.findById(newSubProject._id)
      .populate('members', 'email name initials')
      .lean();

    mainProject.subProjects.push(newSubProject._id);
    await mainProject.save();

    res.status(201).json({
      message: "Sub-project created successfully!",
      subProject: {
        ...populatedSubProject,
        description, // Ensure raw HTML description is returned
        members: populatedSubProject.members.map(member => ({
          _id: member._id,
          email: member.email,
          name: member.name,
          initials: member.initials || member.name?.slice(0, 2).toUpperCase() || 'U'
        }))
      }
    });
  } catch (error) {
    console.error("Error creating sub-project:", error);
    res.status(500).json({ message: "Error creating sub-project", error: error.message });
  }
};

// Get sub-projects
exports.getSubProjectsByMainProject = async (req, res) => {
  try {
    const { mainProjectId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(mainProjectId)) {
      return res.status(400).json({ message: "Invalid project ID ." });
    }

    const mainProject = await Project.findById(mainProjectId);

    if (!mainProject) {
      return res.status(404).json({ message: "Main project not found" });
    }

    if (mainProject.owner.toString() !== userId && !mainProject.members.includes(userId)) {
      return res.status(403).json({ message: "Access denied. You are not a member of this project." });
    }

    const subProjects = await SubProject.find({
      mainProject: new mongoose.Types.ObjectId(mainProjectId),
      deletedAt: null,
    }).populate({
      path: 'members',
      select: 'name email initials photo',
      options: {
        transform: (doc) => {
          if (!doc) return null;
          return {
            ...doc, // Use doc directly since it's a plain object
            initials: doc.initials || getInitials(doc.name),
            photo: doc.photo && doc.photo.data
              ? {
                data: doc.photo.data.toString('base64'),
                contentType: doc.photo.contentType,
              }
              : null,
          };
        },
      },
    }).lean();

    if (subProjects.length === 0) {
      return res.status(404).json([]);
    }
    // Ensure description is returned as-is (HTML content)
    const formattedSubProjects = subProjects.map(subProject => ({
      ...subProject,
      description: subProject.description, // Preserve HTML content
      members: subProject.members.map(member => ({
        ...member,
        initials: member.initials || getInitials(member.name) || 'U'
      }))
    }));
    if (formattedSubProjects.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json({ subProjects: formattedSubProjects });
  } catch (error) {
    console.error("Error fetching sub-projects:", error);
    res.status(500).json({ message: "Error fetching sub-projects", error: error.message });
  }
};

// Update sub-project status
exports.updateSubProjectStatus = async (req, res) => {
  try {
    const { subProjectId, status } = req.body;

    const validStatuses = ["To Do", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const subProject = await SubProject.findById(subProjectId);
    if (!subProject) {
      return res.status(404).json({ message: "Sub-project not found" });
    }

    if (!subProject.members.includes(req.user.id.toString())) {
      return res.status(403).json({ message: "Only assigned members can update the status." });
    }

    subProject.status = status;

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

// Permanent delete a sub-project
exports.deleteSubProjectPermanent = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params;
    const ownerId = req.user.id;

    const subProject = await SubProject.findOne({ _id: subProjectId, mainProject: mainProjectId });

    if (!subProject) {
      return res.status(404).json({ message: 'Sub-project not found or does not belong to the main project' });
    }

    if (subProject.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You do not have permission to delete this sub-project' });
    }

    await subProject.deleteOne();

    res.status(200).json({ message: 'Sub-project deleted successfully', subProject });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting sub-project', error: error.message });
  }
};

// Soft delete a sub-project
exports.deleteSubProject = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params;
    const ownerId = req.user.id;

    const subProject = await SubProject.findOne({ _id: subProjectId, mainProject: mainProjectId });

    if (!subProject) {
      return res.status(404).json({ message: 'Sub-project not found or does not belong to the main project' });
    }

    if (subProject.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You do not have permission to delete this sub-project' });
    }

    subProject.deletedAt = new Date();
    await subProject.save();

    res.status(200).json({ message: 'Sub-project moved to trash successfully', subProject });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting sub-project', error: error.message });
  }
};

// Get deleted sub-projects
exports.getDeletedSubProjects = async (req, res) => {
  try {
    const { mainProjectId } = req.params;
    const ownerId = req.user.id;

    const deletedSubProjects = await SubProject.find({
      owner: ownerId,
      mainProject: mainProjectId,
      deletedAt: { $ne: null },
    });

    if (deletedSubProjects.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(deletedSubProjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deleted subprojects', error: error.message });
  }
};

// Restore a sub-project
exports.restoreSubProject = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params;
    const ownerId = req.user.id;

    const subProject = await SubProject.findOne({ _id: subProjectId, mainProject: mainProjectId });

    if (!subProject) {
      return res.status(404).json({ message: 'Sub-project not found or does not belong to the main project' });
    }

    if (subProject.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'You do not have permission to restore this sub-project' });
    }

    subProject.deletedAt = null;
    await subProject.save();

    res.status(200).json({ message: 'Sub-project restored successfully', subProject });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring sub-project', error: error.message });
  }
};

// Update a sub-project
exports.updateSubProject = async (req, res) => {
  try {
    const { mainProjectId, subProjectId } = req.params;
    const { title, description, dueDate, status, addMembers, removeMembers } = req.body;
    const userId = req.user.id;

    const subProject = await SubProject.findOne({
      _id: subProjectId,
      mainProject: mainProjectId,
    });

    if (!subProject) {
      return res.status(404).json({ message: "Sub-project not found or does not belong to the main project" });
    }

    if (subProject.owner.toString() !== userId && !subProject.members.some(id => id.toString() === userId)) {
      return res.status(403).json({ message: "You do not have permission to update this sub-project" });
    }

    const mainProject = await Project.findById(mainProjectId);
    if (!mainProject) {
      return res.status(404).json({ message: "Main project not found" });
    }

    if (title) subProject.title = title;
    if (description) subProject.description = description; // Store HTML description from editor
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

    const mainProjectMemberIds = mainProject.members.map(id => id.toString());

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
          newMemberIds.push(userIdStr);
        }
      }
      subProject.members = [...new Set([...subProject.members.map(id => id.toString()), ...newMemberIds])];
    }

    if (Array.isArray(removeMembers) && removeMembers.length > 0) {
      const memberIdsToRemove = [];
      for (const email of removeMembers) {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: `User with email ${email} not found` });
        }
        const userIdStr = user._id.toString();
        if (subProject.members.some(id => id.toString() === userIdStr)) {
          memberIdsToRemove.push(userIdStr);
        }
      }
      subProject.members = subProject.members.filter(id => !memberIdsToRemove.includes(id.toString()));
    }

    await subProject.save();

    // Populate members with full user details
    const populatedSubProject = await SubProject.findById(subProjectId)
      .populate('members', 'email name initials')
      .lean();

    res.status(200).json({
      message: "Sub-project updated successfully",
      subProject: {
        ...populatedSubProject,
        description, // Ensure raw HTML description is returned
        members: populatedSubProject.members.map(member => ({
          _id: member._id,
          email: member.email,
          name: member.name,
          initials: member.initials || member.name?.slice(0, 2).toUpperCase() || 'U'
        })),
        removeMembers,
      }
    });
  } catch (error) {
    console.error("Error updating sub-project:", error);
    res.status(500).json({ message: "Error updating sub-project", error: error.message });
  }
};

// Get sub-project by ID
exports.getSubProjectById = async (req, res) => {
  const { mainProjectId, subProjectId } = req.params;

  try {
    const mainTask = await Project.findById(mainProjectId);
    if (!mainTask) {
      return res.status(404).json({ message: "Main task not found" });
    }
    const subproject = await SubProject.findById(subProjectId)
      .populate('mainProject')
      .populate({
        path: 'owner members',
        select: 'name email initials photo',
        options: {
          transform: (doc) => {
            if (!doc) return null;
            return {
              ...doc, // Use doc directly since it's a plain object
              initials: doc.initials || getInitials(doc.name),
              photo: doc.photo && doc.photo.data
                ? {
                  data: doc.photo.data.toString('base64'),
                  contentType: doc.photo.contentType,
                }
                : null,
            };
          },
        },
      })
      .lean();

    if (!subproject) {
      return res.status(404).json({ message: "Subproject not found" });
    }

    // Ensure description is returned as-is (HTML content)
    const formattedSubproject = {
      ...subproject,
      description: subproject.description, // Preserve HTML content
      members: subproject.members.map(member => ({
        ...member,
        initials: member.initials || getInitials(member.name) || 'U'
      }))
    };

    res.json(formattedSubproject);
  } catch (error) {
    console.error("Error fetching subproject:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format." });
    }

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: userId }, { members: userId }],
      deletedAt: null,
    })
      .populate({
        path: 'owner',
        select: 'name email initials photo',
        options: {
          transform: (doc) => {
            if (!doc) return null;
            return {
              ...doc,
              initials: doc.initials || getInitials(doc.name),
              photo: doc.photo && doc.photo.data
                ? {
                  data: doc.photo.data.toString('base64'),
                  contentType: doc.photo.contentType,
                }
                : null,
            };
          },
        },
      })
      .populate({
        path: 'members',
        select: 'name email initials photo',
        options: {
          transform: (doc) => {
            if (!doc) return null;
            return {
              ...doc,
              initials: doc.initials || getInitials(doc.name),
              photo: doc.photo && doc.photo.data
                ? {
                  data: doc.photo.data.toString('base64'),
                  contentType: doc.photo.contentType,
                }
                : null,
            };
          },
        },
      })
      .lean();

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you do not have access to it.",
      });
    }

    // Ensure description is returned as-is (HTML content)
    const formattedProject = {
      ...project,
      description: project.description,
      members: project.members
        .filter(member => member != null) // Filter out null members
        .map(member => ({
          ...member,
          initials: member.initials || getInitials(member.name) || 'U'
        }))
    };

    res.status(200).json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
};

// Get project status counts
exports.getProjectStatusCountsWithAggregation = async (req, res) => {
  try {
    const userId = req.user.id;

    const statusCounts = await Project.aggregate([
      {
        $match: {
          $or: [{ owner: new mongoose.Types.ObjectId(userId) }, { members: new mongoose.Types.ObjectId(userId) }],
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let totalProjects = 0;
    let counts = { toDo: 0, inProgress: 0, completed: 0 };

    statusCounts.forEach((group) => {
      totalProjects += group.count;
      switch (group._id) {
        case "To Do":
          counts.toDo = group.count;
          break;
        case "In Progress":
          counts.inProgress = group.count;
          break;
        case "Completed":
          counts.completed = group.count;
          break;
      }
    });

    res.status(200).json({
      message: "Project status counts retrieved successfully",
      statusCounts: { totalProjects, ...counts },
    });
  } catch (error) {
    console.error("Error fetching project status counts:", error);
    res.status(500).json({
      message: "Error fetching project status counts",
      error: error.message,
    });
  }
};

// Get detailed project analytics for the logged-in user
exports.getProjectAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    // Aggregation for project statistics
    const projectStats = await Project.aggregate([
      {
        $match: {
          $or: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { members: new mongoose.Types.ObjectId(userId) },
          ],
          deletedAt: null,
        },
      },
      {
        $facet: {
          // Status counts
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          // Overdue projects
          overdueProjects: [
            {
              $match: {
                dueDate: { $lt: currentDate },
                status: { $ne: "Completed" },
              },
            },
            { $count: "overdueCount" },
          ],
          // Total projects
          totalProjects: [
            { $count: "totalCount" },
          ],
          // Subproject completion stats
          subProjectStats: [
            {
              $lookup: {
                from: "subprojects",
                localField: "_id",
                foreignField: "mainProject",
                as: "subProjects",
              },
            },
            { $unwind: { path: "$subProjects", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalSubProjects: { $sum: 1 },
                completedSubProjects: {
                  $sum: {
                    $cond: [{ $eq: ["$subProjects.status", "Completed"] }, 1, 0],
                  },
                },
              },
            },
          ],
          // Member workload
          memberWorkload: [
            { $unwind: "$members" },
            {
              $group: {
                _id: "$members",
                projectCount: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo",
              },
            },
            { $unwind: "$userInfo" },
            {
              $project: {
                email: "$userInfo.email",
                projectCount: 1,
              },
            },
          ],
        },
      },
    ]);

    // Process the results
    const statusCounts = { toDo: 0, inProgress: 0, completed: 0 };
    projectStats[0].statusCounts.forEach((group) => {
      switch (group._id) {
        case "To Do":
          statusCounts.toDo = group.count;
          break;
        case "In Progress":
          statusCounts.inProgress = group.count;
          break;
        case "Completed":
          statusCounts.completed = group.count;
          break;
      }
    });

    const totalProjects = projectStats[0].totalProjects[0]?.totalCount || 0;
    const overdueProjects = projectStats[0].overdueProjects[0]?.overdueCount || 0;
    const totalSubProjects = projectStats[0].subProjectStats[0]?.totalSubProjects || 0;
    const completedSubProjects = projectStats[0].subProjectStats[0]?.completedSubProjects || 0;

    const completionRate = totalProjects > 0 ? (statusCounts.completed / totalProjects) * 100 : 0;
    const subProjectCompletionRate = totalSubProjects > 0 ? (completedSubProjects / totalSubProjects) * 100 : 0;

    // Response
    res.status(200).json({
      message: "Project analytics retrieved successfully",
      analytics: {
        totalProjects,
        statusCounts,
        overdueProjects,
        completionRate: completionRate.toFixed(2) + "%",
        subProjectStats: {
          totalSubProjects,
          completedSubProjects,
          subProjectCompletionRate: subProjectCompletionRate.toFixed(2) + "%",
        },
        memberWorkload: projectStats[0].memberWorkload,
      },
    });
  } catch (error) {
    console.error("Error fetching project analytics:", error);
    res.status(500).json({
      message: "Error fetching project analytics",
      error: error.message,
    });
  }
};