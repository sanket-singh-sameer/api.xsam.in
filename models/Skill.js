import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		category: {
			type: String,
			default: 'general',
			enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'soft-skill', 'general'],
		},
		proficiency: {
			type: Number,
			required: [true, 'Proficiency is required'],
			min: [1, 'Proficiency must be at least 1'],
			max: [100, 'Proficiency cannot exceed 100'],
			default: 50,
		},
		yearsOfExperience: {
			type: Number,
			default: 0,
			min: [0, 'Years of experience cannot be negative'],
			max: [50, 'Years of experience cannot exceed 50'],
		},
		icon: {
			type: String,
			default: null,
		},
		isVisible: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
