import jwt, {} from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Please login - No auth header",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token || token === "undefined" || token === "null") {
            res.status(401).json({
                success: false,
                message: "Please login - No token provided",
            });
            return;
        }
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                success: false,
                message: "Invalid token",
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({
            message: "Please login - JWT error",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
};
export default isAuth;
//# sourceMappingURL=isAuth.js.map