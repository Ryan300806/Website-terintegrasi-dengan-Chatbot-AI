const express = require("express");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.get(
    "/sales",
    reportController.getSalesReport
);

router.get(
    "/sales/export",
    reportController.exportSalesReport
);

module.exports = router;