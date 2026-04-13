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

const toSlug = (value) => {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
};

const skillSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Skill name is required'],
			trim: true,
			minlength: [1, 'Skill name cannot be empty'],
			maxlength: [60, 'Skill name cannot exceed 60 characters'],
			unique: true,
			index: true,
		},
		slug: {
			type: String,
			unique: true,
			index: true,
		},
		category: {
			type: String,
			trim: true,
			default: 'general',
			enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'soft-skill', 'general'],
			index: true,
		},
		proficiency: {
			type: Number,
			required: [true, 'Proficiency is required'],
			min: [1, 'Proficiency must be at least 1'],
			max: [100, 'Proficiency cannot exceed 100'],
			default: 50,
			index: true,
		},
		yearsOfExperience: {
			type: Number,
			default: 0,
			min: [0, 'Years of experience cannot be negative'],
			max: [50, 'Years of experience cannot exceed 50'],
		},
		description: {
			type: String,
			trim: true,
			default: null,
			maxlength: [500, 'Description cannot exceed 500 characters'],
		},
		icon: {
			type: String,
			trim: true,
			default: null,
			validate: {
				validator: isValidUrl,
				message: 'Icon must be a valid http/https URL',
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

skillSchema.pre('validate', function normalizeSkill(next) {
	if (this.name) {
		this.name = this.name.trim();
		this.slug = toSlug(this.name);
	}

	if (!Array.isArray(this.relatedTechnologies)) {
		this.relatedTechnologies = [];
	}

	next();
});

skillSchema.index({ isVisible: 1, isFeatured: 1, category: 1, sortOrder: 1, proficiency: -1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
