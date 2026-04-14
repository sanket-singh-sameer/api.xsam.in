import Project from '../models/Project.js';

export const listProjects = async (req, res) => {
	try {
		const projects = await Project.find({ isVisible: true }).sort({ createdAt: -1 });
		return res.status(200).json(projects);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const createProject = async (req, res) => {
	try {
		const project = await Project.create(req.body);
		return res.status(201).json(project);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const updateProjectById = async (req, res) => {
	try {
		const { id } = req.params;
		const project = await Project.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}

		return res.status(200).json(project);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};
