import fs from 'fs'
import qrimg from 'qr-image'

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys"

import DBController from './dbController.js'
import { errorObj, successObj } from '../setting.js';

const sessions = {};
const new_sessions = {};
const session_dir = process.env.API_URL || 'http://localhost:5555' + '/sessions/';

const WAREAL = {
    generateInstanceId: function(res) {
      const instance_id = 'instance_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      return res.json({ ...successObj, data: { instance_id: instance_id } });
    },

    startWASocket: async function(instance_id){
        const { state, saveCreds } = await useMultiFileAuthState('sessions/'+instance_id);
    
        const WA = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          markOnlineOnConnect: false,
          receivedPendingNotifications: false,
        });
    
        await WA.ev.on('connection.update', async ( { connection, lastDisconnect, isNewLogin, qr } ) => {

          // Get QR COde
          if(qr != undefined){
            console.log("QR: ", qr)

            WA.qrcode = qr;
          }
    
          // Login successful
          if(isNewLogin){
            console.log("Login Successfull......................................................................................................")

            // Remove QR code
            if(sessions[instance_id].qrcode != undefined){
              delete sessions[instance_id].qrcode;

              // Add account
              DBController.add({ instance_id, user: WA.user }).then(res => console.log(res))
            }
            
            // Reload session after login successful
            await WAREAL.startWASocket(instance_id);
          }
    
          if(lastDisconnect != undefined && lastDisconnect.error != undefined){
            var statusCode = lastDisconnect.error.output.statusCode;
            if( DisconnectReason.connectionClosed == statusCode ){
              //await WAREAL.startWASocket(instance_id);
            }
    
            if( DisconnectReason.restartRequired == statusCode){
              //sessions[instance_id] = await WAREAL.startWASocket(instance_id);
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
                            
                // sessions[instance_id] = await WAREAL.startWASocket(instance_id);
              }else{
                // await WAREAL.startWASocket(instance_id);
              }
            }
          }
    
          // Connection status
          switch(connection) {
            case "close":
              // 401 Unauthorized
              if(lastDisconnect.error != undefined){
                var statusCode = lastDisconnect.error.output.statusCode;
                console.log("lastdisconnectttttttttttttttttttttttttttttttttttttttttttttttt", statusCode)
              //   if( DisconnectReason.loggedOut == statusCode || 0 == statusCode){
              //     var SESSION_PATH = session_dir + instance_id;
              //     if (fs.existsSync(SESSION_PATH)) {
              //       // unlinkSync
              //       delete sessions[instance_id];
              //     }
    
              // //     await WAREAL.session(instance_id);
              //   }
              }
              break;
    
            case "open":
              // Reload WASocket
              if(WA.user.name == undefined){
                console.log("reloading...................................-----------------------------")
                await DBController.sleep(3000);
                await WAREAL.startWASocket(instance_id);
                break;
              }
    
              sessions[instance_id] = WA;



              console.log("asdasdasdasdasdadasdasdas.........................................................", WA.user)
    
              // Update account
              var session = await DBController.get(instance_id);
              if(session){
                // Get avatar
                WA.user.avatar = await WAREAL.get_avatar(WA);
                console.log("get successfullllllllllll, now saving....................................", WA.user)
                DBController.update({ instance_id, user: WA.user })
                // await WAREAL.add_account(instance_id, session.team_id, WA.user, account);
              }
    
              break;
    
            default:
            // code block
          }
        });
    
        await WA.ev.on('creds.update', saveCreds);
    
        return WA;
    },

    session: async function(instance_id, reset){
        if( sessions[instance_id] == undefined  || reset){
          sessions[instance_id] = await WAREAL.startWASocket(instance_id);
          console.log("newwwwwwwwwwwwwwwwwwwwwwww..............................................")
        }
    
        return sessions[instance_id];
    },

    instance: async function(instance_id, res, callback){
        if(instance_id == undefined && res != undefined){
          if(res){
            return res.json({ ...errorObj, message: "The Instance ID must be provided for the process to be completed" });
          }else{
            return callback(false);
          }
        }
    
        sessions[instance_id] = await WAREAL.session(instance_id, false);
        return callback(sessions[instance_id]);
    },

    get_qrcode: async function(instance_id, res){
      var client = sessions[instance_id];
      if(client == undefined){
        return res.json({ ...errorObj, message: "The WhatsApp session could not be found in the system" });
      }
  
      if(client.qrcode != undefined && !client.qrcode){
        return res.json({ ...errorObj, message: "It seems that you have logged in successfully" });
      }
  
      //Check QR code exist
      for( var i = 0; i < 10; i++) {
        if( client.qrcode == undefined ){
          await DBController.sleep(1000);
        }
      }
  
      if(client.qrcode == undefined || client.qrcode == false){
        return res.json({ ...errorObj, message: "The system cannot generate a WhatsApp QR code" });
      }
  
      var code = qrimg.imageSync(client.qrcode, { type: 'png' });
      return res.json({ ...successObj, data: { base64: 'data:image/png;base64,'+code.toString('base64') } });
    },

    get_info: async function(instance_id, res){
        await DBController.sleep(1500);
        var client = sessions[instance_id];
        if(client != undefined && client.user != undefined){
          if(client.user.name == undefined) {
            console.log("waiting")
            await DBController.sleep(1500);
            console.log("waiting2")

          }
          client.user.avatar = await WAREAL.get_avatar( client );
          console.log(client?.user, client?.user?.avatar)
          return res.json({ ...successObj, data: { user: client.user } });
        }else{
          return res.json({ ...errorObj, message: "Please relogin to get desired information" });
        }
    },

    get_avatar: async function(client){
        // try{
        //   console.log("heyyyyyy")
        //   const ppUrl = await client.profilePictureUrl( client.user.id );
        //   console.log("heyyyyyy222222222222222")
        //   return ppUrl;
        // }catch(e){
        //   console.log("byeeeeeeeeeeee", e)
        //   return DBController.get_avatar( client.user.name );
        // }
        try {
          console.log(client?.user, client?.user?.id)
          const ppUrl = await client.profilePictureUrl( client?.user?.id );
          console.log('Profile Picture URL:', ppUrl);
          return ppUrl;
        } catch (err) {
          console.error('Error fetching profile picture:', err);
        //   return DBController.get_avatar( client.user.name );
          return null;
        }
    },

    waitForOpenConnection: async function(socket){
        return new Promise((resolve, reject) => {
          const maxNumberOfAttempts = 10
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
        console.log("logging out.................................................................")
        DBController.delete(instance_id)
    
        if(sessions[ instance_id ]){
          var readyState = await WAREAL.waitForOpenConnection(sessions[ instance_id ].ws);
          if(readyState === 1){
            await DBController.sleep(500);
            sessions[ instance_id ].end();
          }
    
          var SESSION_PATH = session_dir + instance_id;
          if (fs.existsSync(SESSION_PATH)) {
            // unlinkSync
          }
          delete sessions[ instance_id ];
    
          if(res != undefined){
            return res.json({ ...successObj, message: 'Logged Out Successfully' });
          }
        }else{
          if(res != undefined){
            return res.json({ ...errorObj, message: 'This account seems to have logged out before.' });
          }
        }
    },
    
    send_message: async function(instance_id, data, res){
      try {
        await DBController.sleep(500);

        if(sessions[instance_id] != undefined && sessions[instance_id].user != undefined){          
          await DBController.sleep(500);
          
          const id = `${data?.number}@s.whatsapp.net`
    
          const sentMsg = await sessions[instance_id].sendMessage(id, { text: data?.message });
        
          return res.json({ ...successObj, data: { user: sessions[instance_id].user, message: sentMsg } });
        }else{
          return res.json({ ...errorObj, message: "Please relogin to perform desired operation" });
        }
      } catch (err) {
        return res.json({ ...errorObj, message: "Please relogin to perform desired operation" });
      }
    },
}

export default WAREAL