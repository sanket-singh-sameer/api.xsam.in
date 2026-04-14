import express from 'express';
import { createSkill, listSkills, updateSkillById } from '../../controllers/skill.controller.js';
import { protectApi } from '../../middlewares/auth.middleware.js';

const skillsApiRouter = express.Router();

skillsApiRouter.get('/', listSkills);
skillsApiRouter.post('/', protectApi, createSkill);
skillsApiRouter.put('/:id', protectApi, updateSkillById);



export default skillsApiRouter;
