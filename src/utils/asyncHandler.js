// Using Promise method 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=> next(err))
    }
}


export { asyncHandler }






/* 
//const asyncHandler = () => {}
//const asyncHandler = (func) => {async ()=> {}}
//const asyncHandler = (func) => async ()=> {}

// // Using async await  method......
const asyncHandler = (func) => async(err,req, res,next) => {
    try {
        await func(err, req, res, next)
    } catch (error) {
        req.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
export { asyncHandler } */
