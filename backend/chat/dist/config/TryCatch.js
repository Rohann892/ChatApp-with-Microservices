const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "An unexpected error occurred",
                });
            }
        }
    };
};
export default TryCatch;
//# sourceMappingURL=TryCatch.js.map