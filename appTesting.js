const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrimg = require('qr-image');

const sessions = {};
const new_sessions = {};
const session_dir = __dirname+'/../sessions/';

const WAREAL = {

    makeWASocket: async function(instance_id){
        const { state, saveCreds } = await useMultiFileAuthState('sessions/'+instance_id);
    
        const WA = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          markOnlineOnConnect: false,
          receivedPendingNotifications: false,
        });
    
        await WA.ev.on('connection.update', async ( { connection, lastDisconnect, isNewLogin, qr } ) => {

          console.log("Begining: ", connection, lastDisconnect, isNewLogin, qr, sessions, new_sessions)

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

            // Reload session after login successful
            await WAREAL.makeWASocket(instance_id);
          }
    
        //   if(lastDisconnect != undefined && lastDisconnect.error != undefined){
        //     var statusCode = lastDisconnect.error.output.statusCode;
        //     if( DisconnectReason.connectionClosed == statusCode ){
        //       //await WAREAL.makeWASocket(instance_id);
        //     }
    
        //     if( DisconnectReason.restartRequired == statusCode){
        //       //sessions[instance_id] = await WAREAL.makeWASocket(instance_id);
        //     }
    
        //     if( DisconnectReason.loggedOut == statusCode){
        //       await WAREAL.logout(instance_id);
        //     }else{
    
        //       if(sessions[instance_id]){
        //         var readyState = await WAREAL.waitForOpenConnection(sessions[ instance_id ].ws);
        //         if(readyState === 1){
        //           sessions[ instance_id ].end();
        //         }
    
        //         delete sessions[ instance_id ];
        //         delete chatbots[ instance_id ];
        //         delete bulks[ instance_id ];
        //         sessions[instance_id] = await WAREAL.makeWASocket(instance_id);
        //       }else{
        //         await WAREAL.makeWASocket(instance_id);
        //       }
        //     }
        //   }
    
        //   // Connection status
        //   switch(connection) {
        //     case "close":
        //       // 401 Unauthorized
        //       if(lastDisconnect.error != undefined){
        //         var statusCode = lastDisconnect.error.output.statusCode;
        //         if( DisconnectReason.loggedOut == statusCode || 0 == statusCode){
        //           var SESSION_PATH = session_dir + instance_id;
        //           if (fs.existsSync(SESSION_PATH)) {
        //             rimraf.sync(SESSION_PATH);
        //             delete sessions[instance_id];
        //             delete chatbots[ instance_id ];
        //             delete bulks[ instance_id ];
        //           }
    
        //           await WAREAL.session(instance_id);
        //         }
        //       }
        //       break;
    
        //     case "open":
        //       // Reload WASocket
        //       if(WA.user.name == undefined){
        //         await Common.sleep(3000);
        //         await WAREAL.makeWASocket(instance_id);
        //         break;
        //       }
    
        //       sessions[instance_id] = WA;
    
        //       // Remove QR code
        //       if(sessions[instance_id].qrcode != undefined){
        //         delete sessions[instance_id].qrcode;
        //         delete new_sessions[instance_id];
        //       }
    
        //       // Add account
        //       var session = await Common.db_get("sp_whatsapp_sessions", [ { instance_id: instance_id }, { status: 0 } ]);
        //       if(session){
        //         // Get avatar
        //         WA.user.avatar = await WAREAL.get_avatar(WA);
    
        //         var account = await Common.db_get("sp_accounts", [ { token: instance_id } ]);
        //         if(!account){
        //           account = await Common.db_get("sp_accounts", [ { pid: Common.get_phone(WA.user.id, "wid")}, {team_id: session.team_id } ]);
        //         }
    
        //         await Common.update_status_instance(instance_id, WA.user);
        //         await WAREAL.add_account(instance_id, session.team_id, WA.user, account);
        //       }
    
        //       break;
    
        //     default:
        //     // code block
        //   }
        });
    
        await WA.ev.on('creds.update', saveCreds);
    
        return WA;
    },

    session: async function(instance_id, reset){
        if( sessions[instance_id] == undefined  || reset){
          sessions[instance_id] = await WAREAL.makeWASocket(instance_id);
        }
    
        return sessions[instance_id];
    },

    instance: async function(instance_id, login, res, callback){
        if(instance_id == undefined && res != undefined){
          if(res){
            return { status: 'error', message: "The Instance ID must be provided for the process to be completed" }
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
        return { status: 'error', message: "The WhatsApp session could not be found in the system" }
      }
  
      if(client.qrcode != undefined && !client.qrcode){
        return { status: 'error', message: "It seems that you have logged in successfully" }
      }
  
      //Check QR code exist
    //   for( var i = 0; i < 10; i++) {
    //     if( client.qrcode == undefined ){
    //       await Common.sleep(1000);
    //     }
    //   }
  
      if(client.qrcode == undefined || client.qrcode == false){
        return { status: 'error', message: "The system cannot generate a WhatsApp QR code" }
      }
  
      var code = qrimg.imageSync(client.qrcode, { type: 'png' });
      return { status: 'success', message: 'Success', base64: 'data:image/png;base64,'+code.toString('base64') }
    },

}


setTimeout(async () => {
    const result = await WAREAL.instance('66423E71471CD', true, {}, async (client) => {
        await WAREAL.get_qrcode('66423E71471CD', {});
    });

    console.log(result)
}, 1000)