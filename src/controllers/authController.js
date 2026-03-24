const authService = require("../services/authService");

// POST /auth/login
exports.unifiedLogin = async (req, res) => {
  try {
    const result = await authService.unifiedLogin(req.body);

    res.json(result);
  } catch (err) {
    console.error("UNIFIED LOGIN ERROR:", err);

    res.status(400).json({
      message: err.message,
    });
  }
};