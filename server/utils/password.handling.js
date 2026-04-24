import bcrypt from "bcryptjs"

export const hashedPassword=(password)=>{
    return bcrypt.hash(password,10)
}