import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Sender name is required'],
			trim: true,
			minlength: [2, 'Sender name must be at least 2 characters'],
			maxlength: [100, 'Sender name cannot exceed 100 characters'],
		},
		email: {
			type: String,
			required: [true, 'Sender email is required'],
			trim: true,
			lowercase: true,
		},
		phone: {
			type: String,
			trim: true,
			maxlength: [20, 'Phone number is too long'],
		},
		subject: {
			type: String,
			required: [true, 'Subject is required'],
			trim: true,
			minlength: [3, 'Subject must be at least 3 characters'],
			maxlength: [160, 'Subject cannot exceed 160 characters'],
		},
		message: {
			type: String,
			required: [true, 'Message body is required'],
			trim: true,
			minlength: [10, 'Message must be at least 10 characters'],
			maxlength: [5000, 'Message cannot exceed 5000 characters'],
		},
		status: {
			type: String,
			default: 'new',
			enum: ['new', 'read', 'replied', 'archived', 'spam', 'deleted'],
		},
		priority: {
			type: String,
			default: 'normal',
			enum: ['low', 'normal', 'high'],
		},
	},
	{
		timestamps: true,
	}
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
