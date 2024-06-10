import mongoose, {Schema} from 'mongoose'

class UserInstanceSchema extends Schema {
    constructor() {
        const userInstance = super ({
                instanceId: String,
            },
            {timestamps: true}
        )

        return userInstance
    }
}  

export default mongoose.model('UserInstance', new UserInstanceSchema())