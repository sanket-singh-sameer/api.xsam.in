import mongoose from 'mongoose';

const socialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        profileUrl: {
            type: String,
            default: null,
        },
        iconUrl: {
            type: String,
            default: null,
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true
    }
);

const Social = mongoose.model('Social', socialSchema);

export default Social;
