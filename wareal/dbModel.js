import mongoose from 'mongoose'
const {Schema} = mongoose

class UserInstanceSchema extends Schema {
  constructor () {

    const userInstance = super({
        instance_id: String,
        whatsapp_id: String,
        mobileNo: String,
        name:String,
        avatar: String,
        status: String,
      },
      {timestamps: true},
    )

    return userInstance
  }
}

export default mongoose.model('UserInstance', new UserInstanceSchema())