const asyncHandler = (reqHandler) => {
    return (req,res,next) => {
        Promise.resolve(reqHandler(req,res,next)).catch((err) => next(err))
        // taking advance js promise syntax to make it handle the util package
        // we can also do it by try{}catch() syntax 
    }
}

export {asyncHandler}