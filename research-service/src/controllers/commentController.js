const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const { projectId, text } = req.body;
    // req.user comes from your auth middleware
    const comment = await Comment.create({
      projectId,
      text,
      userId: req.user.id,
      userName: req.user.name
    });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};