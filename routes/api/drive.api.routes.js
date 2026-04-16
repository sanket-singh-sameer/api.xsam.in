import express from "express";
import { getAuthUrl } from "../../services/driveAuthConfig.js";
import { driveAuthController, driveUploadController, oauth2callbackController } from "../../controllers/drive.controller.js";
import { upload } from "../../services/multer.js";
import { protectApi } from "../../middlewares/auth.middleware.js";
const driveApiRouter = express.Router();

driveApiRouter.post("/upload", protectApi, upload.single("file"), driveUploadController);

driveApiRouter.get("/auth", driveAuthController);

driveApiRouter.get("/oauth2callback", oauth2callbackController);

export default driveApiRouter;
