import express from 'express';
import { createProject, listProjects, updateProjectById } from '../../controllers/project.controller.js';
import { protectApi } from '../../middlewares/auth.middleware.js';


const projectsApiRouter = express.Router();

projectsApiRouter.get('/', listProjects);
projectsApiRouter.post('/', protectApi, createProject);
projectsApiRouter.put('/:id', protectApi, updateProjectById);

export default projectsApiRouter;
