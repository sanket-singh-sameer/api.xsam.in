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

const technologySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Technology name is required'],
            trim: true,
            minlength: [1, 'Technology name cannot be empty'],
            maxlength: [40, 'Technology name cannot exceed 40 characters'],
            unique: true,
            index: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
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
        category: {
            type: String,
            trim: true,
            default: 'general',
            enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'general'],
            index: true,
        },
        isVisible: {
            type: Boolean,
            default: true,
            index: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
            min: [0, 'Sort order cannot be negative'],
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

technologySchema.pre('validate', function normalizeTechnology(next) {
    if (this.name) {
        this.name = this.name.trim();
        this.slug = toSlug(this.name);
    }

    next();
});

technologySchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'technologies',
    justOne: false,
});

technologySchema.index({ isVisible: 1, category: 1, sortOrder: 1, name: 1 });

const Technology = mongoose.model('Technology', technologySchema);

export default Technology;