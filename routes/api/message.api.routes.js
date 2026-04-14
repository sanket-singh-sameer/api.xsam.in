import express from "express";
import { listMessages, updateStatusByID, writeMessage } from "../../controllers/message.controller.js";
import { protectApi } from "../../middlewares/auth.middleware.js";

const messagesApiRouter = express.Router();

messagesApiRouter.post("/", writeMessage);
messagesApiRouter.get("/",protectApi, listMessages);
messagesApiRouter.patch("/:id",protectApi, updateStatusByID);

export default messagesApiRouter;
