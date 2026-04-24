import express, {Router} from "express"
const authRoute=express.Router()

authRoute.post('/register')

export default authRoute