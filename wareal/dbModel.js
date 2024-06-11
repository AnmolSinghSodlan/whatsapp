import mongoose from 'mongoose'
const {Schema} = mongoose

class UserInstanceSchema extends Schema {
  constructor () {

    const userInstance = super({
        instanceId: String,
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