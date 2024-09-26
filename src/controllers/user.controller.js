import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { user } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {
    /*
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    i used console.log() for check how data from frontend comes and showed up in the backend through postman and json type.
    */


    // get user details from frontend  
    const { fullName, email, userName, password } = req.body
    // console.log(req.body)
    // check validation - not empty 
    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists : i.e username, email
    const existedUser = await user.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User is already exist with this email or username")
    }

    // check for images,specially check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log('Avatar Path:', avatarLocalPath);
    // const coverImgLocalPath = req.files.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // check by printing
    // console.log('Cover Image Path:', coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is requiered");
    }


    // upload them to cloudinary, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log('Cloudinary Avatar Upload Response:', avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar image is requiered");
    }

    // create user obj - create entry in DB to store all info
    const User = await user.create({
        fullName,
        avatar: avatar.url,
        userName: userName.toLowerCase(),
        coverImage: coverImage?.url || "",
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