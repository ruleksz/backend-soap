const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const kinerjaMemberRoutes = require("./routes/kinerjaMemberRoutes");
const cabuyRoutes = require("./routes/cabuyRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const rumahRoutes = require("./routes/rumahRoutes");
const rekomendasiaiRoutes = require("./routes/rekomendasiaiRoutes");
const crmRoutes = require("./routes/crmRoutes");
const propertiRoutes = require("./routes/propertiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const memberDashboardRoutes = require("./routes/memberDashboardRoutes");

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/kinerja-member", kinerjaMemberRoutes);
app.use("/api/cabuy", cabuyRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/rumah", rumahRoutes);
app.use("/api/rekomendasiai", rekomendasiaiRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/properti", propertiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/member-dashboard", memberDashboardRoutes);

// // Connect DB
sequelize.sync()
    .then(() => console.log("✅ Database connected & synced..."))
    .catch((err) => console.error("DB Error:", err));

// 🔄 Sinkronisasi model dengan database
// sequelize
//     .sync({ alter: true }) // ⬅️ tambahkan alter: true sementara
//     .then(() => {
//         console.log("✅ Database synchronized successfully (with alter mode)!");
//     })
//     .catch((err) => {
//         console.error("❌ Error syncing database:", err);
//     });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("SECRET:", process.env.JWT_SECRET);
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
