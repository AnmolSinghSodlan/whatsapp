const fs = require('fs');
const qrimg = require('qr-image');
const rimraf = require('rimraf');

const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const DBController = require('./wareal/dbController')

const sessions = {};
const new_sessions = {};
const session_dir = __dirname+'/../sessions/';

const WAREAL = {

    generateInstanceId: function(){
        const instance_id = 'instance_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        return { status: 'success', message: 'Success', instance_id: instance_id };
    },

    makeWASocket: async function(instance_id){
      const { state, saveCreds } = await useMultiFileAuthState('sessions/'+instance_id);
  
      const WA = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        markOnlineOnConnect: false,
        receivedPendingNotifications: false,
      });
  
      await WA.ev.on('connection.update', async ( { connection, lastDisconnect, isNewLogin, qr } ) => {

        // console.log("Begining: ", connection, lastDisconnect, isNewLogin, qr, sessions, new_sessions)
        console.log("Begining: ")

        // Get QR COde
        if(qr != undefined){
          console.log("QR: ", qr)

          WA.qrcode = qr;
          if(new_sessions[instance_id] == undefined)
            new_sessions[instance_id] = new Date().getTime()/1000 + 300;
        }
  
        // Login successful
        if(isNewLogin){
          console.log("Login Successfull......................................................................................................")

          // console.log(WA)

          // var readyState = await WAREAL.waitForOpenConnection(sessions[ instance_id ].ws);
          // if(readyState === 1){
          //   // Reload session after login successful
          //   await WAREAL.makeWASocket(instance_id);
          // }
        }
  
        if(lastDisconnect != undefined && lastDisconnect.error != undefined){
          var statusCode = lastDisconnect.error.output.statusCode;
          if( DisconnectReason.connectionClosed == statusCode ){
            //await WAREAL.makeWASocket(instance_id);
          }
  
          if( DisconnectReason.restartRequired == statusCode){
            //sessions[instance_id] = await WAREAL.makeWASocket(instance_id);
          }
  
          if( DisconnectReason.loggedOut == statusCode){
            await WAREAL.logout(instance_id);
          }else{
            if(sessions[instance_id]){
              var readyState = await WAREAL.waitForOpenConnection(sessions[ instance_id ].ws);
              if(readyState === 1){
                sessions[ instance_id ].end();
              }
  
              delete sessions[ instance_id ];
                          
              sessions[instance_id] = await WAREAL.makeWASocket(instance_id);
            }else{
              await WAREAL.makeWASocket(instance_id);
            }
          }
        }
  
        // Connection status
        switch(connection) {
          case "close":
            // 401 Unauthorized
            if(lastDisconnect.error != undefined){
              var statusCode = lastDisconnect.error.output.statusCode;
              if( DisconnectReason.loggedOut == statusCode || 0 == statusCode){
                var SESSION_PATH = session_dir + instance_id;
                if (fs.existsSync(SESSION_PATH)) {
                  rimraf.sync(SESSION_PATH);
                  delete sessions[instance_id];
                }
  
                await WAREAL.session(instance_id);
              }
            }
            break;
  
          case "open":
            // Reload WASocket
            if(WA.user.name == undefined){
              console.log("1st .......................................................................")

              // await DBController.sleep(3000);
              // await WAREAL.makeWASocket(instance_id);
              // break;
            }
  
            sessions[instance_id] = WA;

            console.log("2nd .......................................................................")
  
            // Remove QR code
            if(sessions[instance_id].qrcode != undefined){
              console.log("3rd .......................................................................")

              delete sessions[instance_id].qrcode;
              delete new_sessions[instance_id];

              console.log("4th .......................................................................")

              // Add account
              // DBController.add({ instance_id, user: WA.user })
            }
  
            // Update account
            // var session = await DBController.get(instance_id);
            // if(session){
            //   // Get avatar
            //   WA.user.avatar = await WAREAL.get_avatar(WA);
  
            //   DBController.update({ instance_id, user: WA.user })
            //   await WAREAL.add_account(instance_id, session.team_id, WA.user, account);
            // }
  
            break;
  
          default:
          // code block
        }
      });

      console.log("Ending: ", WA?.user)
  
      await WA.ev.on('creds.update', saveCreds);
  
      return WA;
    },

    session: async function(instance_id, reset){
        if( sessions[instance_id] == undefined  || reset){
          sessions[instance_id] = await WAREAL.makeWASocket(instance_id);
        }
    
        return sessions[instance_id];
    },

    instance: async function(instance_id, res, callback){
        if(instance_id == undefined && res != undefined){
          if(res){
            return res.json({ status: 'error', message: "The Instance ID must be provided for the process to be completed" });
          }else{
            return callback(false);
          }
        }
    
        // var session = await Common.db_get("sp_whatsapp_sessions", [ { instance_id: instance_id } ]);
    
        // if(!session){
        //   Common.db_update("sp_accounts", [ { status: 0 }, { token: instance_id } ]);
    
        //   if(res){
        //     return res.json({ status: 'error', message: "The Instance ID provided has been invalidated" });
        //   }else{
        //     return callback(false);
        //   }
        // }
    
        // if(login){
        //   var SESSION_PATH = session_dir + instance_id;
        //   if (fs.existsSync(SESSION_PATH)) {
        //     rimraf.sync(SESSION_PATH);
        //   }
        //   delete sessions[ instance_id ];
        // }
    
        sessions[instance_id] = await WAREAL.session(instance_id, false);
        return callback(sessions[instance_id]);
    },

    get_qrcode: async function(instance_id, res){
      var client = sessions[instance_id];
      if(client == undefined){
        return res.json({ status: 'error', message: "The WhatsApp session could not be found in the system" });
      }
  
      if(client.qrcode != undefined && !client.qrcode){
        return res.json({ status: 'error', message: "It seems that you have logged in successfully" });
      }
  
      //Check QR code exist
      for( var i = 0; i < 10; i++) {
        if( client.qrcode == undefined ){
          await DBController.sleep(1000);
        }
      }
  
      if(client.qrcode == undefined || client.qrcode == false){
        return res.json({ status: 'error', message: "The system cannot generate a WhatsApp QR code" });
      }
  
      var code = qrimg.imageSync(client.qrcode, { type: 'png' });
      return res.json({ status: 'success', message: 'Success', base64: 'data:image/png;base64,'+code.toString('base64') });
    },

    get_info: async function(instance_id, res){
        var client = sessions[instance_id];
        if(client != undefined && client.user != undefined){
          if(client.user.avatar == undefined) await DBController.sleep(1500);
          client.user.avatar = await WAREAL.get_avatar( client );
          return res.json({ status: 'success', message: "Success", data: client.user });
        }else{
          return res.json({ status: 'error', message: "Error", relogin: true });
        }
    },

    get_avatar: async function(client){
        try{
          const ppUrl = await client.profilePictureUrl( client.user.id );
          return ppUrl;
        }catch(e){
          // return DBController.get_avatar(client.user.name);
        }
    },

    waitForOpenConnection: async function(socket){
        return new Promise((resolve, reject) => {
          const maxNumberOfAttempts = 5
          const intervalTime = 200 //ms
    
          let currentAttempt = 0
          const interval = setInterval(() => {
            if (currentAttempt > maxNumberOfAttempts - 1) {
              clearInterval(interval)
              resolve(0)
            } else if (socket.readyState === socket.OPEN) {
              clearInterval(interval)
              resolve(1)
            }
            currentAttempt++
          }, intervalTime)
        })
    },

    logout: async function(instance_id, res){
      // DBController.delete(instance_id)
  
      if(sessions[ instance_id ]){
        var readyState = await WAREAL.waitForOpenConnection(sessions[ instance_id ].ws);
        if(readyState === 1){
          await DBController.sleep(500);
          sessions[ instance_id ].end();
        }
  
        var SESSION_PATH = session_dir + instance_id;
        if (fs.existsSync(SESSION_PATH)) {
          console.log("deleting", SESSION_PATH)
          rimraf.sync(SESSION_PATH);
        }
        delete sessions[ instance_id ];
  
        if(res != undefined){
          return res.json({ status: 'success', message: 'Logout Successfull' });
        }
      }else{
        if(res != undefined){
          return res.json({ status: 'error', message: 'This account seems to have logged out before.' });
        }
      }
  },

  send_message: async function(instance_id, res){
    try {
      if(sessions[instance_id] != undefined && sessions[instance_id].user != undefined){
        console.log(sessions[instance_id].user)
        
        await DBController.sleep(500);
        
        const id = '919568174952@s.whatsapp.net'
  
        const sentMsg = await sessions[instance_id].sendMessage(id, { text: "oh hello there 4" });
  
        console.log(sentMsg)
  
        return res.json({ status: 'success', message: "Success", User: sessions[instance_id].user, Message: sentMsg });
      }else{
        return res.json({ status: 'error', message: "Error", relogin: true });
      }
    } catch (err) {
      return res.json({ status: 'error', message: "Error", Error: err, relogin: true });
    }
  },
}

let res = {
  json: function (props) {
    console.log(props)
  },
}

setTimeout(async () => {
    const { instance_id } = WAREAL.generateInstanceId()

    console.log(instance_id)
  
    const result = await WAREAL.instance(instance_id, res, async (client) => {
        await WAREAL.get_qrcode(instance_id, res);
    });

    console.log(result)

    // const instance_id = 'instance_1718087608377_629' // Test

    // const instance_id = 'instance_1718094731039_440' // Me, problem - failed to find key \"AAAAALNt\" to decode mutation

    // const result = await WAREAL.instance(instance_id, res, async (client) => {
    //   await WAREAL.get_info(instance_id, res);
    // });

    // console.log(result)

    // const result = await WAREAL.instance(instance_id, res, async (client) => {
    //   await WAREAL.send_message(instance_id, res);
    // });

    // console.log(result)

    // const result = await WAREAL.instance(instance_id, res, async (client) => {
    //   await WAREAL.logout(instance_id, res);
    // });

    // console.log(result)

    // DBController.add({ instance_id, user: { name: 'abcd' } }).then((res) => console.log(res))

}, 1000)