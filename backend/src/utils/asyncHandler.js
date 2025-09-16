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
            res.status(Number(error.code) || 500)
            .json({
                success: false,
                message: error.message || "INTERNAL SERVER ERROR"
            })
        })
    }
}
