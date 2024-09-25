import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { user } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend  
    const { fullname, email, username, password } = req.body
    console.log("email : ", email);

    // check validation - not empty 
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists : i.e username, email
    const existedUser = user.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User is already exist with this email or username")
    }

    // check for images,specially check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is requiered");
    }

    // upload them to cloudinary, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImgLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar image is requiered");
    }

    // create user obj - create entry in DB to store all info
    const User = await user.create({
        fullname,
        avatar: avatar.url,
        username: username.toLowerCase(),
        coverImage: coverImage.url || "",
        password,
        email
    })

    // remove password and refresh token field from response 
    const createdUser = await user.findById(User._id).select(
        "-password -refreshToken"
    )

    // check for user creation 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while user registration")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registration SuccessFully :)")
    )



})


export { registerUser };