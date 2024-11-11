import { sendEmailController } from "controllers/email";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";


const router = Router();

router.post("/sendEmail",checkJwt, sendEmailController);

export default router;
