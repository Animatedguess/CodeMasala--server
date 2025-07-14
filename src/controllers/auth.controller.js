import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const signUp = async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;

  // Basic field validation
  if ([username, password, confirmPassword, email].some(field => !field?.trim())) {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are required"));
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json(new ApiError(400, "Password and confirm password must match"));
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res
        .status(409)
        .json(new ApiError(409, "Username or email already in use"));
    }

    const newUser = await User.create({
      username,
      password,
      email
    });

    if (!newUser) {
      return res
        .status(500)
        .json(new ApiError(500, "Error occurred during user creation"));
    }

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json(
      new ApiResponse(201, "User registered successfully", userObj)
    );
  } catch (error) {
    console.error("SignUp Error:", error);
    res
      .status(500)
      .json(new ApiError(500, error?.message || "Internal Server Error"));
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and password are required"));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "User does not exist in the database"));
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json(new ApiError(401, "Incorrect password"));
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refresh_token = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .json(new ApiResponse(200, "Login successful", {
        accessToken,
        refreshToken
      }));

  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json(new ApiError(500, error?.message || "Internal Server Error"));
  }
};

const logOut = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }

    // Clear refresh token in DB
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refresh_token: 1 }
      },
      { new: true }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict"
    };

    res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions) // fixed name
      .json(new ApiResponse(200, "Successfully logged out"));
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json(new ApiError(500, error?.message || "Something went wrong"));
  }
};

export {
  signUp,
  signIn,
  logOut
}