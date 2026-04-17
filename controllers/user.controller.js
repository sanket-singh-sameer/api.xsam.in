import User from "../models/User.js";

export const getPublicUser = async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: "admin" })
      .sort({ createdAt: 1 })
      .select("_id name email tagline bio avatar resumeURL location website role");

    const fallbackUser = !adminUser
      ? await User.findOne({})
          .sort({ createdAt: 1 })
          .select("_id name email tagline bio avatar resumeURL location website role")
      : null;

    const user = adminUser || fallbackUser;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const payload = user.toObject();
    if (payload.resumeURL !== undefined && payload.resumeUrl === undefined) {
      payload.resumeUrl = payload.resumeURL;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      tagline,
      bio,
      avatar,
      resumeURL,
      resumeUrl,
      resume_url,
      location,
      website,
    } = req.body;

    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (tagline !== undefined) user.tagline = tagline;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    const normalizedResumeURL = resumeURL ?? resumeUrl ?? resume_url;
    if (normalizedResumeURL !== undefined) user.resumeURL = normalizedResumeURL;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    const payload = user.toObject();
    if (payload.resumeURL !== undefined && payload.resumeUrl === undefined) {
      payload.resumeUrl = payload.resumeURL;
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: "Could not update user" });
  }
};
