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

const messageSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Sender name is required'],
			trim: true,
			minlength: [2, 'Sender name must be at least 2 characters'],
			maxlength: [100, 'Sender name cannot exceed 100 characters'],
			index: true,
		},
		email: {
			type: String,
			required: [true, 'Sender email is required'],
			trim: true,
			lowercase: true,
			validate: {
				validator: isValidEmail,
				message: 'Please provide a valid email address',
			},
			index: true,
		},
		subject: {
			type: String,
			required: [true, 'Subject is required'],
			trim: true,
			minlength: [3, 'Subject must be at least 3 characters'],
			maxlength: [160, 'Subject cannot exceed 160 characters'],
			index: true,
		},
		message: {
			type: String,
			required: [true, 'Message body is required'],
			trim: true,
			minlength: [10, 'Message must be at least 10 characters'],
			maxlength: [5000, 'Message cannot exceed 5000 characters'],
		},
		phone: {
			type: String,
			trim: true,
			default: null,
			maxlength: [30, 'Phone number cannot exceed 30 characters'],
		},
		company: {
			type: String,
			trim: true,
			default: null,
			maxlength: [120, 'Company name cannot exceed 120 characters'],
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
		source: {
			type: String,
			trim: true,
			default: 'portfolio-contact',
			enum: ['portfolio-contact', 'dashboard', 'api', 'other'],
			index: true,
		},
		status: {
			type: String,
			default: 'new',
			enum: ['new', 'read', 'replied', 'archived', 'spam'],
			index: true,
		},
		priority: {
			type: String,
			default: 'normal',
			enum: ['low', 'normal', 'high'],
			index: true,
		},
		tags: {
			type: [
				{
					type: String,
					trim: true,
					minlength: [1, 'Tag cannot be empty'],
					maxlength: [30, 'Tag cannot exceed 30 characters'],
				},
			],
			default: [],
			validate: {
				validator: (items) => {
					const normalized = items.map((item) => item.toLowerCase());
					return new Set(normalized).size === normalized.length;
				},
				message: 'Tags must not contain duplicates',
			},
		},
		isRead: {
			type: Boolean,
			default: false,
			index: true,
		},
		isFlagged: {
			type: Boolean,
			default: false,
			index: true,
		},
		readAt: {
			type: Date,
			default: null,
		},
		repliedAt: {
			type: Date,
			default: null,
		},
		archivedAt: {
			type: Date,
			default: null,
		},
		ipAddress: {
			type: String,
			trim: true,
			default: null,
			select: false,
		},
		userAgent: {
			type: String,
			trim: true,
			default: null,
			maxlength: [400, 'User agent cannot exceed 400 characters'],
			select: false,
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

messageSchema.pre('validate', function normalizeMessage(next) {
	if (this.name) {
		this.name = this.name.trim();
	}

	if (this.email) {
		this.email = this.email.trim().toLowerCase();
	}

	if (Array.isArray(this.tags)) {
		this.tags = this.tags
			.map((tag) => (typeof tag === 'string' ? tag.trim() : tag))
			.filter((tag) => Boolean(tag));
	}

	next();
});

messageSchema.pre('save', function syncStatusFields(next) {
	if (this.status === 'read' && !this.readAt) {
		this.readAt = new Date();
	}

	if (this.status === 'replied' && !this.repliedAt) {
		this.repliedAt = new Date();
		this.isRead = true;
		this.readAt = this.readAt || new Date();
	}

	if (this.status === 'archived' && !this.archivedAt) {
		this.archivedAt = new Date();
	}

	if (this.isRead && !this.readAt) {
		this.readAt = new Date();
	}

	next();
});

messageSchema.index({ status: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ isFlagged: 1, priority: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
