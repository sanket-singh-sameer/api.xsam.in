import express from 'express';
import { createSocial, listSocials, updateSocialById } from '../../controllers/social.controller.js';
import { protectApi } from '../../middlewares/auth.middleware.js';

const socialsApiRouter = express.Router();

socialsApiRouter.get('/', listSocials);
socialsApiRouter.post('/', protectApi, createSocial);
socialsApiRouter.put('/:id', protectApi, updateSocialById);

export default socialsApiRouter;
