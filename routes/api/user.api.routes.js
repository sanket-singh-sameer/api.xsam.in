import express from 'express';
import { getPublicUser, updateUser } from '../../controllers/user.controller.js';
import { protectApi } from '../../middlewares/auth.middleware.js';


const usersApiRouter = express.Router();

usersApiRouter.get('/public', getPublicUser);
usersApiRouter.put('/', protectApi, updateUser);


export default usersApiRouter;
