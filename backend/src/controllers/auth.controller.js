import { User } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // dont check anything before save
        return {accessToken , refreshToken}; 
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating refresh and access token")
    }
};

export const register = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if(
        [fullName , email , password].some((field) => 
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are compulsory")
    } 

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, "User already exists")
    }

    const user = await User.create(
        { 
            fullName,
            email, 
            password
        }
    );

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500 , "Something went wrong while registering a user");
    }

    return res.status(201)
    .json(
        new ApiResponse(
            200,
            createdUser,
            "User Registered Successfully"
        )
    );
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if(!email) {
        throw new ApiError(400 , "Email is required");
    }

    const user = await User.findOne({ email });

    if(!user) {
        throw new ApiError(404 , "User does not exist");
    }

    const isPasswordVaild = await user.isPasswordCorrect(password);
    
    if (!isPasswordVaild) {
        throw new ApiError(401 , "Invalid User credentails");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: '/',     
        domain: '.onrender.com'
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    );
});


export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
           }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: '/',     
        domain: '.onrender.com'
    }
 
    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200 , {} , "User logged Out")
    )
});