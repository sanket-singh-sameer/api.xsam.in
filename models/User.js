import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: 2,
			maxlength: 80,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: 8,
			select: false,
		},
		role: {
			type: String,
			enum: ['auth', 'admin'],
			default: 'auth',
		},
		refreshTokenHash: {
			type: String,
			select: false,
			default: null,
		},
		refreshTokenExpiresAt: {
			type: Date,
			select: false,
			default: null,
		},
		tagline: {
			type: String,
			default: null,
		},
		bio: {
			type: String,
			default: null,
		},
		avatar: {
			type: String,
			default: null,
		},
		location: {
			type: String,
			default: null,
		},
		website: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function hashPassword() {
	if (!this.isModified('password')) {
		return;
	}

	this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
	return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
