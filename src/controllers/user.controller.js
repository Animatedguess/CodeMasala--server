import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// note:-
// req.user --> to access the data from Clerk Database

const updateUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const {
      name,
      gender,
      country,
      state,
      district,
      date,
      month,
      year,
      summary,
      website,
      skillsets,
      judge0ApiKey
    } = req.body;

    const updates = {};

    if (name?.trim()) updates.name = name.trim();
    if (gender) updates.gender = gender;

    if (country || state || district) {
      updates.location = {};
      if (country?.trim()) updates.location.country = country.trim();
      if (state?.trim()) updates.location.state = state.trim();
      if (district?.trim()) updates.location.district = district.trim();
    }

    if (date || month || year) {
      updates.birthday = {};
      if (date) updates.birthday.date = parseInt(date);
      if (month) updates.birthday.month = parseInt(month);
      if (year) updates.birthday.year = parseInt(year);
    }

    if (summary?.trim()) updates.summary = summary.trim();

    if (Array.isArray(website)) {
      updates.website = website.map((link) => link.trim()).filter(Boolean);
    }

    if (Array.isArray(skillsets)) {
      updates.skillset = skillsets.map((skill) => skill.trim()).filter(Boolean);
    }

    if (typeof judge0ApiKey === "string" && judge0ApiKey.trim()) {
      updates.judge0ApiKey = judge0ApiKey.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(new ApiError(400, "No valid fields to update"));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refresh_token");

    return res.status(200).json(
      new ApiResponse(200, "User profile updated successfully", updatedUser)
    );
  } catch (error) {
    console.error("Update Error:", error);

    // Handle unique constraint error for judge0ApiKey
    if (error.code === 11000 && error.keyPattern?.judge0ApiKey) {
      return res.status(400).json(new ApiError(400, "Judge0 API key already in use"));
    }

    return res.status(500).json(
      new ApiError(500, error?.message || "Internal Server Error")
    );
  }
};

export {
    updateUser
};