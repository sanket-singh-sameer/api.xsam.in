import Timeline from '../models/Timeline.js';

export const listTimelines = async (req, res) => {
	try {
		const timelines = await Timeline.find({ isVisible: true }).sort({ createdAt: -1 });
		return res.status(200).json(timelines);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const createTimeline = async (req, res) => {
	try {
		const timeline = await Timeline.create(req.body);
		return res.status(201).json(timeline);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const updateTimelineById = async (req, res) => {
	try {
		const { id } = req.params;
		const timeline = await Timeline.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!timeline) {
			return res.status(404).json({ message: 'Timeline not found' });
		}

		return res.status(200).json(timeline);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};
