import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: [true, 'Timeline type is required'],
			enum: ['education', 'experience', 'project', 'achievement', 'certification', 'other'],
			default: 'experience',
			index: true,
		},
		title: {
			type: String,
			required: [true, 'Timeline title is required'],
			minlength: [2, 'Timeline title must be at least 2 characters'],
			maxlength: [120, 'Timeline title cannot exceed 120 characters'],
		},
		organization: {
			type: String,
			required: [true, 'Organization is required'],
			minlength: [2, 'Organization must be at least 2 characters'],
			maxlength: [120, 'Organization cannot exceed 120 characters'],
		},
		location: {
			type: String,
			default: null,
			maxlength: [120, 'Location cannot exceed 120 characters'],
		},
		startDate: {
			type: String,
			required: [true, 'Start date is required'],
		},
		endDate: {
			type: String,
			default: null,
		},
		isCurrent: {
			type: Boolean,
			default: false,
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			minlength: [10, 'Description must be at least 10 characters'],
			maxlength: [3000, 'Description cannot exceed 3000 characters'],
		},
		relatedSkills: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Skill',
				},
			],
			default: [],
		},
		credentialUrl: {
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


const Timeline = mongoose.model('Timeline', timelineSchema);

export default Timeline;
