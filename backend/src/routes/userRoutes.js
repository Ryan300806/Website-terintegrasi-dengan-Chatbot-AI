const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);

router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

router.patch(
    "/:id/status",
    userController.updateUserStatus
);

router.patch(
    "/:id/password",
    userController.changePassword
);

module.exports = router;