import {
  createDataFromPostman,
  generateReport,
  getData,
  getLatestData,
} from "controllers/weather";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/createDataFromPostman", checkJwt, createDataFromPostman);
router.get("/data/:id/:from/:to/:metric", checkJwt, getData);
router.get("/latest/:id", checkJwt, getLatestData)
router.post("/report", checkJwt, generateReport);

export default router;
