import Skill from '../models/Skill.js';

export const listSkills = async (req, res) => {
	try {
		const skills = await Skill.find({ isVisible: true }).sort({ createdAt: -1 });
		return res.status(200).json(skills);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const createSkill = async (req, res) => {
	try {
		const skill = await Skill.create(req.body);
		return res.status(201).json(skill);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const updateSkillById = async (req, res) => {
	try {
		const { id } = req.params;
		const skill = await Skill.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!skill) {
			return res.status(404).json({ message: 'Skill not found' });
		}

		return res.status(200).json(skill);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};
