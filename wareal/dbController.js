const { MongoClient } = require("mongodb");
import InstanceUser from 'dbModel'
const mongoURL = "mongodb+srv://anmolsingh3445:anmolsingh3445@whatsappcluster.phjd5fq.mongodb.net/";

const DBController = {
    sleep: async function (ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    },

    getInstance: async function(instance_id){
        var res = await new Promise( async (resolve, reject)=>{
        //   var data = [{
        //     instance_id: instance_id
        //   }];
    
        //   db_connect.query( "SELECT * FROM sp_whatsapp_sessions WHERE ?", data,  (err, res)=>{
        //     return resolve(res);
        //   });
        });
        // return Common.response(res, true);
      },
}

modules.export = DBController