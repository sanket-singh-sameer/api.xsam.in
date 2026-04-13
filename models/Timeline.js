import mongoose from 'mongoose';

const isValidUrl = (value) => {
	if (!value) {
		return true;
	}

	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch (error) {
		return false;
	}
};

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
			trim: true,
			minlength: [2, 'Timeline title must be at least 2 characters'],
			maxlength: [120, 'Timeline title cannot exceed 120 characters'],
			index: true,
		},
		organization: {
			type: String,
			required: [true, 'Organization is required'],
			trim: true,
			minlength: [2, 'Organization must be at least 2 characters'],
			maxlength: [120, 'Organization cannot exceed 120 characters'],
			index: true,
		},
		location: {
			type: String,
			trim: true,
			default: null,
			maxlength: [120, 'Location cannot exceed 120 characters'],
		},
		startDate: {
			type: Date,
			required: [true, 'Start date is required'],
			index: true,
		},
		endDate: {
			type: Date,
			default: null,
			index: true,
		},
		isCurrent: {
			type: Boolean,
			default: false,
			index: true,
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			trim: true,
			minlength: [10, 'Description must be at least 10 characters'],
			maxlength: [3000, 'Description cannot exceed 3000 characters'],
		},
		highlights: {
			type: [
				{
					type: String,
					trim: true,
					minlength: [2, 'Highlight must be at least 2 characters'],
					maxlength: [240, 'Highlight cannot exceed 240 characters'],
				},
			],
			default: [],
			validate: {
				validator: (items) => {
					const normalized = items.map((item) => item.toLowerCase());
					return new Set(normalized).size === normalized.length;
				},
				message: 'Highlights must not contain duplicates',
			},
		},
		relatedProjects: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Project',
				},
			],
			default: [],
			validate: {
				validator: (items) => {
					const ids = items.map((item) => item.toString());
					return new Set(ids).size === ids.length;
				},
				message: 'Related projects must not contain duplicate references',
			},
		},
		relatedSkills: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Skill',
				},
			],
			default: [],
			validate: {
				validator: (items) => {
					const ids = items.map((item) => item.toString());
					return new Set(ids).size === ids.length;
				},
				message: 'Related skills must not contain duplicate references',
			},
		},
		relatedTechnologies: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Technology',
				},
			],
			default: [],
			validate: {
				validator: (items) => {
					const ids = items.map((item) => item.toString());
					return new Set(ids).size === ids.length;
				},
				message: 'Related technologies must not contain duplicate references',
			},
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
		credentialUrl: {
			type: String,
			trim: true,
			default: null,
			validate: {
				validator: isValidUrl,
				message: 'Credential URL must be a valid http/https URL',
			},
		},
		isVisible: {
			type: Boolean,
			default: true,
			index: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
			index: true,
		},
		sortOrder: {
			type: Number,
			default: 0,
			min: [0, 'Sort order cannot be negative'],
			index: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			virtuals: true,
			transform: (_doc, ret) => {
				ret.id = ret._id.toString();
				delete ret._id;
				return ret;
			},
		},
		toObject: {
			virtuals: true,
		},
	}
);

timelineSchema.pre('validate', function normalizeTimeline(next) {
	if (Array.isArray(this.highlights)) {
		this.highlights = this.highlights
			.map((item) => (typeof item === 'string' ? item.trim() : item))
			.filter((item) => Boolean(item));
	}

	if (!Array.isArray(this.relatedProjects)) {
		this.relatedProjects = [];
	}

	if (!Array.isArray(this.relatedSkills)) {
		this.relatedSkills = [];
	}

	if (!Array.isArray(this.relatedTechnologies)) {
		this.relatedTechnologies = [];
	}

	if (this.isCurrent) {
		this.endDate = null;
	}

	next();
});

timelineSchema.path('endDate').validate(function validateEndDate(value) {
	if (this.isCurrent || !value) {
		return true;
	}

	return value.getTime() >= this.startDate.getTime();
}, 'End date cannot be earlier than start date');

timelineSchema.index({ isVisible: 1, type: 1, startDate: -1, sortOrder: 1 });
timelineSchema.index({ isVisible: 1, isFeatured: 1, sortOrder: 1, createdAt: -1 });
timelineSchema.index({ createdBy: 1, isVisible: 1, startDate: -1, sortOrder: 1 });

const Timeline = mongoose.model('Timeline', timelineSchema);

export default Timeline;
