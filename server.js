const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ضع هنا رابط Webhook الخاص بقناة الديسكورد في سيرفركم
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK_URL_HERE';

// قاعدة بيانات الرتب والصلاحيات (Role-Based Access Control)
let rolesPermissions = {
    "Minister": { viewStats: true, manageRanks: true, issueWarrants: true, viewSecretCID: true },
    "SWAT Commander": { viewStats: true, manageRanks: false, issueWarrants: true, viewSecretCID: false },
    "Cadet": { viewStats: true, manageRanks: false, issueWarrants: false, viewSecretCID: false }
};

// مسار التحقق من عمل السيرفر
app.get('/', (req, res) => {
    res.send('LAW CITY CFW External Backend System is Online & Running 100%!');
});

// مسار إرسال التنبيهات المباشرة إلى الديسكورد
app.post('/api/discord/alert', async (req, res) => {
    const { title, description, officer, type } = req.body;
    let embedColor = type === 'alert' ? 15158332 : 3066993; // أحمر للطوارئ أو أخضر للعام

    const discordPayload = {
        embeds: [{
            title: `🚨 LAW CITY CFW - ${title}`,
            description: description,
            color: embedColor,
            fields: [
                { name: "Issued By Officer", value: officer || "System Automation", inline: true },
                { name: "Department", value: "LSPD Central Command", inline: true }
            ],
            footer: { text: "LAW CITY CFW Security Matrix • Automated System" },
            timestamp: new Date()
        }]
    };

    try {
        if (DISCORD_WEBHOOK_URL.includes('YOUR_DISCORD_WEBHOOK')) {
            return res.status(400).json({ success: false, error: "Please configure your Discord Webhook URL first!" });
        }
        await axios.post(DISCORD_WEBHOOK_URL, discordPayload);
        res.status(200).json({ success: true, message: "Alert sent to Discord successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// مسار التحقق من الصلاحيات
app.post('/api/permissions/check', (req, res) => {
    const { role, action } = req.body;
    const permissions = rolesPermissions[role];

    if (!permissions) {
        return res.status(403).json({ allowed: false, message: "Role not recognized." });
    }

    if (permissions[action] === true) {
        return res.json({ allowed: true, message: "Access granted." });
    } else {
        res.status(403).json({ allowed: false, message: "Access denied: Insufficient permissions." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LAW CITY CFW Server running on port ${PORT}`);
});