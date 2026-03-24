const memberService = require("../services/memberService");

// LOGIN
exports.loginMember = async (req, res) => {
  try {
    const data = await memberService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET
exports.getMembers = async (req, res) => {
  try {
    const members = await memberService.getMembers(req.user);
    res.json({ members });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

// CREATE
exports.createMember = async (req, res) => {
  try {
    const data = await memberService.create(req.body, req.user);

    res.status(201).json({
      message: "User berhasil dibuat",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.updateMember = async (req, res) => {
  try {
    const data = await memberService.update(
      req.params.id,
      req.body,
      req.user
    );

    res.json({
      message: "Update berhasil",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteMember = async (req, res) => {
  try {
    await memberService.remove(req.params.id, req.user);

    res.json({
      message: "Member berhasil dihapus",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET LEADERS
exports.getLeadersBySenior = async (req, res) => {
  try {
    const data = await memberService.getLeadersBySenior(req.user);
    res.json({ data });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

// GET LEADER MEMBER CABUY
exports.getLeadersMembersCabuys = async (req, res) => {
  try {
    const data = await memberService.getLeadersMembersCabuys(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

// GET SENIOR
exports.getSeniorLeaders = async (req, res) => {
  try {
    const members = await memberService.getSeniorLeaders(req.user);

    res.json({
      success: true,
      members,
    });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};