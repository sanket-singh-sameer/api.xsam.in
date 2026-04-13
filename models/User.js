import mongoose from 'mongoose';

const isValidEmail = (value) => {
	if (!value) {
		return false;
	}

	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

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

const userSchema = new mongoose.Schema(
	{
		auth: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Auth',
			default: null,
			unique: true,
			sparse: true,
			index: true,
		},
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [80, 'Name cannot exceed 80 characters'],
			index: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			trim: true,
			lowercase: true,
			unique: true,
			index: true,
			validate: {
				validator: isValidEmail,
				message: 'Please provide a valid email address',
			},
		},
		role: {
			type: String,
			enum: ['auth', 'admin'],
			default: 'auth',
			index: true,
		},
		headline: {
			type: String,
			trim: true,
			default: null,
			maxlength: [120, 'Headline cannot exceed 120 characters'],
		},
		bio: {
			type: String,
			trim: true,
			default: null,
			maxlength: [1200, 'Bio cannot exceed 1200 characters'],
		},
		avatar: {
			type: String,
			trim: true,
			default: null,
			validate: {
				validator: isValidUrl,
				message: 'Avatar must be a valid http/https URL',
			},
		},
		location: {
			type: String,
			trim: true,
			default: null,
			maxlength: [120, 'Location cannot exceed 120 characters'],
		},
		website: {
			type: String,
			trim: true,
			default: null,
			validate: {
				validator: isValidUrl,
				message: 'Website must be a valid http/https URL',
			},
		},
		social: {
			github: {
				type: String,
				trim: true,
				default: null,
				validate: {
					validator: isValidUrl,
					message: 'GitHub URL must be valid',
				},
			},
			linkedin: {
				type: String,
				trim: true,
				default: null,
				validate: {
					validator: isValidUrl,
					message: 'LinkedIn URL must be valid',
				},
			},
			x: {
				type: String,
				trim: true,
				default: null,
				validate: {
					validator: isValidUrl,
					message: 'X URL must be valid',
				},
			},
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		lastLoginAt: {
			type: Date,
			default: null,
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

userSchema.pre('validate', function normalizeUser(next) {
	if (this.name) {
		this.name = this.name.trim();
	}

	if (this.email) {
		this.email = this.email.trim().toLowerCase();
	}

	next();
});

userSchema.virtual('projects', {
	ref: 'Project',
	localField: '_id',
	foreignField: 'createdBy',
	justOne: false,
});

userSchema.virtual('technologies', {
	ref: 'Technology',
	localField: '_id',
	foreignField: 'createdBy',
	justOne: false,
});

userSchema.virtual('skills', {
	ref: 'Skill',
	localField: '_id',
	foreignField: 'createdBy',
	justOne: false,
});

userSchema.virtual('timelineEntries', {
	ref: 'Timeline',
	localField: '_id',
	foreignField: 'createdBy',
	justOne: false,
});

userSchema.virtual('assignedMessages', {
	ref: 'Message',
	localField: '_id',
	foreignField: 'assignedTo',
	justOne: false,
});

userSchema.index({ role: 1, isActive: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;
