const memberDashboardService = require("../services/memberDashboardService");

exports.getMemberDashboardStats = async (req, res) => {
    try {
        const data = await memberDashboardService.getStats(
            req.user,
            req.query
        );

        res.json(data);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil data dashboard",
            error: error.message,
        });
    }
};