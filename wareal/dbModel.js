const mongoose = require('mongoose')
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

module.exports = mongoose.model('UserInstance', new UserInstanceSchema())
