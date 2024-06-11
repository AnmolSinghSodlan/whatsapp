import mongoose from 'mongoose'
const {Schema} = mongoose

class UserInstanceSchema extends Schema {
  constructor () {

    const userInstance = super({
        instance_id: String,
        mobileNo: String,
        avatar: String,
        status: String,
      },
      {timestamps: true},
    )

    return userInstance
  }
}

export default mongoose.model('UserInstance', new UserInstanceSchema())