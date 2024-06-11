import pkg from 'mongoose'
const { connect, connection } = pkg
import dotenv from "dotenv"
dotenv.config()

connect(process.env.MONGO_URL)
const db = connection

db.on('connected', () => {
    console.log("Connected to the database")
})

db.on('error', (error) => {
    console.log("Error connecting to the database : " + error)
})

export default db