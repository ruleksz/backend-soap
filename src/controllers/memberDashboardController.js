const memberDashboardService = require("../services/memberDashboardService");

exports.getMemberDashboardStats = async (req, res) => {
    try {
        const data = await memberDashboardService.getStats(req.user);
        res.json(data);
    } catch (error) {
        console.error("Member dashboard error:", error);
        res.status(500).json({
            message: "Gagal mengambil data dashboard",
        });
    }
};