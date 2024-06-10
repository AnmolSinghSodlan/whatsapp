import mongoose, {Schema} from 'mongoose'

class InstanceUserSchema extends Schema {
    constructor() {
        const instanceUser = super ({
                instanceId: String,
            },
            {timestamps: true}
        )

        return instanceUser
    }
}  

export default mongoose.model('InstanceUser', new InstanceUserSchema())