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

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            minlength: [2, 'Project title must be at least 2 characters'],
            maxlength: [120, 'Project title cannot exceed 120 characters'],
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
            trim: true,
            minlength: [10, 'Project description must be at least 10 characters'],
            maxlength: [2000, 'Project description cannot exceed 2000 characters'],
        },
        image: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator: isValidUrl,
                message: 'Image must be a valid http/https URL',
            },
        },
        githubLink: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator: isValidUrl,
                message: 'GitHub link must be a valid http/https URL',
            },
        },
        liveLink: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator: isValidUrl,
                message: 'Live link must be a valid http/https URL',
            },
        },
        technologies: {
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
                message: 'Technologies must not contain duplicate references',
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
        isDeployed: {
            type: Boolean,
            default: false,
            index: true,
        },
        isVisible: {
            type: Boolean,
            default: true,
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

projectSchema.pre('validate', function normalizeProjectFields(next) {
    if (!Array.isArray(this.technologies)) {
        this.technologies = [];
    }

    next();
});

projectSchema.index({ isVisible: 1, isDeployed: 1, createdAt: -1 });
projectSchema.index({ createdBy: 1, isVisible: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;