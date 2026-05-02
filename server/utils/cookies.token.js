import jwt from "jsonwebtoken"
export function genToken(payload){
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
}