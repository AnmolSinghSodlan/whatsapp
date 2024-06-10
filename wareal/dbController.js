const { MongoClient } = require("mongodb");
const UserInstance = require('./dbModel')
const mongoURL = "mongodb+srv://anmolsingh3445:anmolsingh3445@whatsappcluster.phjd5fq.mongodb.net/";

export const errorObj = {error: true, type: 'error', success: false}
export const successObj = {error: false, type: 'success', success: true}

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
            const userInstance = new UserInstance()
            _.each(data, (v, k) => {
                userInstance[k] = v
            })
        
            try {
              let data = await userInstance.save()
              resolve({...successObj, data, message: 'UserInstance saved successfully'})
            } catch (e) {
              // console.log(e)
              resolve({...errorObj, data: null})
            }
        })
    },

    get: (data) => {
        return new Promise (async (resolve) => {
            try {
              const userInstance = UserInstance.findOne({ instance_id: data })
              if(userInstance) {
                resolve({...successObj, data: userInstance})
              } else {
              resolve({...errorObj, data: null, message: 'UserInstance not present'})
              }
            } catch (e) {
              // console.log(e)
              resolve({...errorObj, data: null})
            }
        })
    },

    update: (data) => {
        return new Promise (async (resolve) => {
            if(!data.instance_id){
              resolve({...errorObj, data: null, message: 'InstanceId not present'})
            }

            let userInstance = UserInstance.findOne({ instance_id: data.instance_id })
            _.each(data, (v, k) => {
                userInstance[k] = v
            })
        
            try {
              let data = await userInstance.save()
              resolve({...successObj, data, message: 'UserInstance saved successfully'})
            } catch (e) {
              // console.log(e)
              resolve({...errorObj, data: null})
            }
        })
    },

    delete: (data) => {
        return new Promise (async (resolve) => {
            UserInstance.findOneAndDelete({ instance_id: data }).then(() => {
              resolve({...successObj, message: 'UserInstance deleted successfully'})
            }).catch((err) => {
              resolve({...errorObj, error: err})
            })            
        })
    },
}

module.exports = DBController