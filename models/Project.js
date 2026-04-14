import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
        },
        image: {
            type: String,
            default: null,
        },
        githubLink: {
            type: String,
            default: null,
        },
        liveLink: {
            type: String,
            default: null,
        },
        technologies: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Technology',
                },
            ],
            default: [],
        },
        isDeployed: {
            type: Boolean,
            default: false,
        },
        isVisible: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;