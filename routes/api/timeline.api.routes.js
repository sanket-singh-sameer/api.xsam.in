import express from 'express';
import { createTimeline, listTimelines, updateTimelineById } from '../../controllers/timeline.controller.js';
import { protectApi } from '../../middlewares/auth.middleware.js';


const timelinesApiRouter = express.Router();

timelinesApiRouter.get('/', listTimelines);
timelinesApiRouter.post('/', protectApi, createTimeline);
timelinesApiRouter.put('/:id', protectApi, updateTimelineById);


export default timelinesApiRouter;
