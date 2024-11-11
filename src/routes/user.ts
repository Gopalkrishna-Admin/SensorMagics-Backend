import {
  adminSignUp,
  changeNewPassword,
  changePassword,
  deactiveUser,
  deleteUser,
  forgotPassword,
  generateCredentials,
  getAllUsers,
  getPreference,
  getUserNotification,
  login,
  logoutFromAllDevices,
  resetPassword,
  signUp,
  updatePreference,
  updateUserDetail,
  updateUserNotification,
} from "controllers/user";
import { Router } from "express";
import { checkAdminJwt, checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/signUp", checkAdminJwt, signUp);
router.post("/adminSignUp", adminSignUp);
router.post("/generateCredentials", checkAdminJwt, generateCredentials);
router.delete("/:id", checkAdminJwt, deleteUser);
router.get("/all", checkAdminJwt, getAllUsers);
router.put("/preference", checkJwt, updatePreference);
router.get("/preference", checkJwt, getPreference);
router.post("/message", checkAdminJwt, updateUserNotification);
router.get("/message", checkJwt, getUserNotification);
router.get("/deactive", checkAdminJwt, deactiveUser);

router.post("/login", login);
router.post("/changePassword", checkJwt, changePassword);
router.post("/changeNewPassword", checkJwt, changeNewPassword);
router.post("/logoutFromAllDevices", checkJwt, logoutFromAllDevices);
router.post("/resetPassword", checkJwt, resetPassword);
router.post("/forgotPassword", forgotPassword);
router.put("/userDetails", checkJwt, updateUserDetail);

export default router;
