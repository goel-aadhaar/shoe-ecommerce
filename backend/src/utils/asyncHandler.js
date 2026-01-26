// const asyncHandler = (fn) => async (req , res , next) => {
//     try {
//         await fn(req , res , next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "INTERNAL SERVER ERROR"
//         })
//     }
// }

export const asyncHandler = (requestHandler) => {
    return async (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next))
        .catch((error) => {
            const statusCode = Number(error.code);
            const validStatus = statusCode >= 100 && statusCode < 600 ? statusCode : 500;
            res.status(validStatus)
            .json({
                success: false,
                message: error.message || "INTERNAL SERVER ERROR"
            })
        })
    }
}
