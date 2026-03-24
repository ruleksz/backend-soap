const dashboardService = require("../services/dashboardService");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const data = await dashboardService.getAdminStats(req.user);

    res.json(data);
  } catch (err) {
    console.error("Dashboard Admin Error:", err);

    res.status(403).json({
      message: err.message,
    });
  }
};