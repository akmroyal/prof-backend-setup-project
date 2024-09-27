import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { user } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const User = await user.findById(userId)
        const accessToken = User.generateAccessToken()
        const refreshToken = User.generateRefreshToken()

        User.refreshToken = refreshToken
        await User.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    // req.body = data
    //username = email
    // find the user
    // password check
    // access and refresh token
    // send cookies and res

    const { email, username, password } = req.body
    if (!username && email) {
        throw new ApiError(400, "username or password is required")
    }
    const User = await user.findOne({
        $or: [{ email }, { username }]
    })

    if (!User) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await User.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is invalid")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(User._id)

    const loggedInUser = await user.findById(User._id).
        select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    user.findByIdAndUpdate(
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
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged Out Successfully :)"))
})


export {
    registerUser,
    loginUser,
    logOutUser
};