import _ from 'lodash'
import UserInstance from './dbModel.js'

const errorObj = {error: true, type: 'error', success: false}
const successObj = {error: false, type: 'success', success: true}

const DBController = {
    sleep: async function (ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    },

    // getInstance: async function(instance_id){
    //     var res = await new Promise( async (resolve, reject)=>{
    //     //   var data = [{
    //     //     instance_id: instance_id
    //     //   }];
    
    //     //   db_connect.query( "SELECT * FROM sp_whatsapp_sessions WHERE ?", data,  (err, res)=>{
    //     //     return resolve(res);
    //     //   });
    //     });
    //     // return Common.response(res, true);
    //   },

    add: (data) => {
        return new Promise (async (resolve) => {
            console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", data)

            const userInstance = new UserInstance()

            let mobileNo = data?.user?.id.includes(':') ? data?.user?.id.split(':')[0] : data?.user?.id.split('@')[0]

            const userData = {
              instance_id: data?.instance_id,
              whatsapp_id: data?.user?.id,
              mobileNo: mobileNo,
              name: data?.user?.name,
              avatar: data?.user?.avatar,
              status: 'connected'
            }
            _.each(userData, (v, k) => {
                userInstance[k] = v
            })
        
            try {
              let data = await userInstance.save()
              resolve({...successObj, data, message: 'UserInstance saved successfully'})
            } catch (e) {
              console.log(e)
              resolve({...errorObj, data: null})
            }
        })
    },

    get: (data) => {
        return new Promise (async (resolve) => {
            try {
              const userInstance = UserInstance.findOne({ instance_id: data })
              if(userInstance) {
                resolve(userInstance)
              } else {
              resolve(null)
              }
            } catch (e) {
              console.log(e)
              resolve(null)
            }
        })
    },

    get_avatar: (data) => {
      return new Promise (async (resolve) => {
        try {
          console.log("helooooooo")
          const userInstance = UserInstance.findOne({ name: data })
          if(userInstance) {
            resolve(userInstance?.avatar)
          } else {
            console.log("heafadfadfsdafsdfsd")
            resolve(null)
          }
        } catch (e) {
          console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", e)
          resolve(null)
        }
      })
    },

    update: (data) => {
        return new Promise (async (resolve) => {
            if(!data.instance_id){
              resolve({...errorObj, data: null, message: 'InstanceId not present'})
            }

            let userInstance = await UserInstance.findOne({ instance_id: data.instance_id })
            
            if(userInstance) {
              let mobileNo = data?.user?.id.includes(':') ? data?.user?.id.split(':')[0] : data?.user?.id.split('@')[0]

              const userData = {
                instance_id: data?.instance_id,
                whatsapp_id: data?.user?.id,
                mobileNo: mobileNo,
                name: data?.user?.name,
                avatar: data?.user?.avatar,
                status: 'connected'
              }

              _.each(userData, (v, k) => {
                  userInstance[k] = v
              })
          
              try {
                let data = await userInstance.save()
                resolve({...successObj, data, message: 'UserInstance saved successfully'})
              } catch (e) {
                console.log(e)
                resolve({...errorObj, data: null})
              }
            } else {
              resolve({...errorObj, message: 'No UserInstance found', data: null})
            }
        })
    },

    delete: (data) => {
        return new Promise (async (resolve) => {
            UserInstance.findOneAndDelete({ instance_id: data }).then(() => {
              resolve({...successObj, message: 'UserInstance deleted successfully'})
            }).catch((err) => {
              resolve({...errorObj, err: err})
            })            
        })
    },
}

export default DBController