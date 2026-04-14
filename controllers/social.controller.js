import Social from '../models/Social.js';

export const listSocials = async (req, res) => {
	try {
		const socials = await Social.find({ isVisible: true }).sort({ createdAt: -1 });
		return res.status(200).json(socials);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const createSocial = async (req, res) => {
	try {
		const social = await Social.create(req.body);
		return res.status(201).json(social);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const updateSocialById = async (req, res) => {
	try {
		const { id } = req.params;
		const social = await Social.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!social) {
			return res.status(404).json({ message: 'Social not found' });
		}

		return res.status(200).json(social);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};
