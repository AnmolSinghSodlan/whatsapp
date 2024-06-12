let abcd = {
  startWASocket: async function(instance_id){
  const { state, saveCreds } = await useMultiFileAuthState('sessions/'+instance_id);

  const WA = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    markOnlineOnConnect: false,
    receivedPendingNotifications: false,
  });

  await WA.ev.on('connection.update', async ( { connection, lastDisconnect, isNewLogin, qr } ) => {

    // console.log("Begining: ", connection, lastDisconnect, isNewLogin, qr, sessions, new_sessions)

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

      // if (sessions[instance_id]) {
      //   console.log("Closing existing session before reloading...");
      //   sessions[instance_id].end();
      //   delete sessions[instance_id];
      // }

      // Reload session after login successful
      // await DBController.sleep(3000)
      // await WAREAL.startWASocket(instance_id);
      
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
                      
          sessions[instance_id] = await WAREAL.startWASocket(instance_id);
        }else{
          await WAREAL.startWASocket(instance_id);
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

        //     await WAREAL.session(instance_id);
        //   }
        }
        break;

      case "open":
        // Reload WASocket
        // if(WA.user.name == undefined){
        //   await DBController.sleep(3000);
        //   await WAREAL.startWASocket(instance_id);
        //   break;
        // }

        sessions[instance_id] = WA;

        console.log("asdasdasdasdasdadasdasdas.........................................................", WA.user)

        // Remove QR code
        if(sessions[instance_id].qrcode != undefined){
          console.log("asdasdasdasdasdadasdasdas.........................................................................adding", WA.user)
          delete sessions[instance_id].qrcode;
          delete new_sessions[instance_id];

          // Add account
          DBController.add({ instance_id, user: WA.user }).then(res => console.log(res))
        }

        // Update account
        var session = await DBController.get(instance_id);
        if(session){
          // Get avatar
          // WA.user.avatar = await WAREAL.get_avatar(WA);
          console.log("get successfullllllllllll")
          DBController.update({ instance_id, user: WA.user })
          // await WAREAL.add_account(instance_id, session.team_id, WA.user, account);
        }

        break;

      default:
      // code block
    }
  });

  await WA.ev.on('creds.update', saveCreds);

  console.log("i am hereeeeeeeeeeeeeeeeeeeeeeeeeeee")

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

  // var session = await Common.db_get("sp_whatsapp_sessions", [ { instance_id: instance_id } ]);

  // if(!session){
  //   Common.db_update("sp_accounts", [ { status: 0 }, { token: instance_id } ]);

  //   if(res){
  //     return res.json({ ...errorObj, message: "The Instance ID provided has been invalidated" });
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



}






















const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const WAREAL = {

    // generateInstanceId: function() {
    //     return 'instance_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    // },

    makeWASocket: async function(instance_id){
        const { state, saveCreds } = await useMultiFileAuthState('sessions/'+instance_id);
    
        const WA = makeWASocket({
          // connectTimeoutMs: 999999999,
          // defaultQueryTimeoutMs: 999999999,
          auth: state,
          printQRInTerminal: true,
          markOnlineOnConnect: false,
          // logger: P({ level: 'silent' }),
          receivedPendingNotifications: false,
          // browser: [instance_id,'Chrome','96.0.4664.110'],
        });
    
        await WA.ev.on('connection.update', async ( { connection, lastDisconnect, isNewLogin, qr, receivedPendingNotifications } ) => {

          console.log("helooooooooooooooooooooooo", connection, lastDisconnect, isNewLogin, qr)

          /*
          * Get QR COde
          */
          if(qr != undefined){
            WA.qrcode = qr;
            // if(new_sessions[instance_id] == undefined)
            //   new_sessions[instance_id] = new Date().getTime()/1000 + 300;
          }
    
          /*
          * Login successful
          */
          if(isNewLogin){
    
            /*
            * Reload session after login successful
            */
            await WAZIPER.makeWASocket(instance_id);
    
          }
    
          // if(lastDisconnect != undefined && lastDisconnect.error != undefined){
          //   var statusCode = lastDisconnect.error.output.statusCode;
          //   if( DisconnectReason.connectionClosed == statusCode ){
          //     //await WAZIPER.makeWASocket(instance_id);
          //   }
    
          //   if( DisconnectReason.restartRequired == statusCode){
          //     //sessions[instance_id] = await WAZIPER.makeWASocket(instance_id);
          //   }
    
          //   if( DisconnectReason.loggedOut == statusCode){
          //     await WAZIPER.logout(instance_id);
          //   }else{
    
          //     if(sessions[instance_id]){
          //       var readyState = await WAZIPER.waitForOpenConnection(sessions[ instance_id ].ws);
          //       if(readyState === 1){
          //         sessions[ instance_id ].end();
          //       }
    
          //       delete sessions[ instance_id ];
          //       delete chatbots[ instance_id ];
          //       delete bulks[ instance_id ];
          //       sessions[instance_id] = await WAZIPER.makeWASocket(instance_id);
          //     }else{
          //       await WAZIPER.makeWASocket(instance_id);
          //     }
          //   }
          // }
    
          /*
          * Connection status
          */
          // switch(connection) {
          //   case "close":
          //     /*
          //     * 401 Unauthorized
          //     */
          //     if(lastDisconnect.error != undefined){
          //       var statusCode = lastDisconnect.error.output.statusCode;
          //       if( DisconnectReason.loggedOut == statusCode || 0 == statusCode){
          //         var SESSION_PATH = session_dir + instance_id;
          //         if (fs.existsSync(SESSION_PATH)) {
          //           rimraf.sync(SESSION_PATH);
          //           delete sessions[instance_id];
          //           delete chatbots[ instance_id ];
          //           delete bulks[ instance_id ];
          //         }
    
          //         await WAZIPER.session(instance_id);
          //       }
          //     }
          //     break;
    
          //   case "open":
          //     // Reload WASocket
          //     if(WA.user.name == undefined){
          //       await Common.sleep(3000);
          //       await WAZIPER.makeWASocket(instance_id);
          //       break;
          //     }
    
          //     sessions[instance_id] = WA;
    
          //     // Remove QR code
          //     if(sessions[instance_id].qrcode != undefined){
          //       delete sessions[instance_id].qrcode;
          //       delete new_sessions[instance_id];
          //     }
    
          //     // Add account
          //     var session = await Common.db_get("sp_whatsapp_sessions", [ { instance_id: instance_id }, { status: 0 } ]);
          //     if(session){
          //       // Get avatar
          //       WA.user.avatar = await WAZIPER.get_avatar(WA);
    
          //       var account = await Common.db_get("sp_accounts", [ { token: instance_id } ]);
          //       if(!account){
          //         account = await Common.db_get("sp_accounts", [ { pid: Common.get_phone(WA.user.id, "wid")}, {team_id: session.team_id } ]);
          //       }
    
          //       await Common.update_status_instance(instance_id, WA.user);
          //       await WAZIPER.add_account(instance_id, session.team_id, WA.user, account);
          //     }
    
          //     break;
    
          //   default:
          //   // code block
          // }
        });
    
        // await WA.ev.on('messages.upsert', async(messages) => {
        //   WAZIPER.webhook(instance_id, { event: "messages.upsert", data: messages });
        //   if(messages.messages != undefined){
        //     messages = messages.messages;
    
        //     if(messages.length > 0){
        //       for (var i = 0; i < messages.length; i++) {
        //         var message = messages[i];
        //         var chat_id = message.key.remoteJid;
    
        //         if(message.key.fromMe === false && message.key.remoteJid != "status@broadcast" && message.message != undefined){
        //           var user_type = "user";
    
        //           if(chat_id.indexOf("g.us") !== -1){
        //             user_type = "group";
        //           }
    
        //           WAZIPER.chatbot(instance_id, user_type, message);
        //           WAZIPER.autoresponder(instance_id, user_type, message);
        //         }
    
        //         //Add Groups for Export participants
        //         if(message.message != undefined){
        //           if( chat_id.includes("@g.us") ){
        //             if(sessions[instance_id].groups == undefined){
        //               sessions[instance_id].groups = [];
        //             }
    
        //             var newGroup = true;
        //             sessions[instance_id].groups.forEach( async (group) => {
        //               if(group.id == chat_id){
        //                 newGroup = false;
        //               }
        //             });
    
        //             if(newGroup){
        //               await WA.groupMetadata (chat_id).then( async (group) => {
        //                 sessions[instance_id].groups.push( { id: group.id, name: group.subject, size: group.size, desc: group.desc, participants: group.participants });
        //               } ).catch( (err) => {});
        //             }
        //           }
        //         }
    
    
        //       }
        //     }
        //   }
        // });
    
        // await WA.ev.on('contacts.update', async(contacts) => {
        //   WAZIPER.webhook(instance_id, { event: "contacts.update", data:contacts  });
        // });
    
        // await WA.ev.on('contacts.upsert', async(contacts) => {
        //   WAZIPER.webhook(instance_id, { event: "contacts.upsert", data:contacts  });
        // });
    
        // await WA.ev.on('messages.update', async(messages) => {
        //   WAZIPER.webhook(instance_id, { event: "messages.update", data:messages  });
        // });
    
        // await WA.ev.on('groups.update', async(group) => {
        //   WAZIPER.webhook(instance_id, { event: "groups.update", data:group  });
        // });
    
        await WA.ev.on('creds.update', saveCreds);
    
        return WA;
    },

    // session: async function(instance_id, reset){
    //   if( sessions[instance_id] == undefined  || reset){
    //     sessions[instance_id] = await WAZIPER.makeWASocket(instance_id);
    //   }
  
    //   return sessions[instance_id];
    // },
  
    // instance: async function(access_token, instance_id, login, res, callback){
    //   // var time_now = Math.floor(new Date().getTime() / 1000);
  
    //   // if(verify_next < time_now){
    //   //   var options = await Common.db_query(`SELECT value FROM sp_options WHERE name = 'base_url'`);
    //   //   if(!options){
    //   //     if(res){
    //   //       return res.json({ status: 'error', message: "Whoop! The license provided is not valid, please contact the author for assistance" });
    //   //     }else{
    //   //       return callback(false);
    //   //     }
    //   //   }
  
    //   //   var base_url = options.value
    //   //   var license = await Common.db_query(`SELECT * FROM sp_purchases WHERE item_id = '32290038' OR item_id = '32399061'`);
    //   //   if(!license){
    //   //     if(res){
    //   //       return res.json({ status: 'error', message: "Whoop!!The license provided is not valid, please contact the author for assistance" });
    //   //     }else{
    //   //       return callback(false);
    //   //     }
    //   //   }
  
    //   //   var ip = await publicIp.address();
    //   //   var check_license = await new Promise( async (resolve, reject)=>{
    //   //     axios.get('https://stackposts.com/api/check?purchase_code='+license.purchase_code+'&website='+base_url+'&ip='+ip)
    //   //       .then((response) => {
    //   //         if (response.status === 200) {
    //   //           verify_response = response.data;
    //   //           verified = false;
    //   //           return resolve(response.data);
    //   //         }else{
    //   //           verified = true;
    //   //           return resolve(false);
    //   //         }
    //   //       })
    //   //       .catch((err) => {
    //   //         verified = true;
    //   //         return resolve(false);
    //   //       });
    //   //   });
    //   // }
  
    //   // if(verify_next < time_now){
    //   //   verify_next = time_now + 600;
    //   // }
  
    //   // if (verify_response) {
    //   //   if(verify_response.status == "error"){
    //   //     if(res){
    //   //       return res.json({ status: 'error', message: verify_response.message });
    //   //     }else{
    //   //       return callback(false);
    //   //     }
    //   //   }
    //   // }
  
    //   // if (!verified) {
    //   //   if(res){
    //   //     return res.json({ status: 'error', message: "Whoop!!! The license provided is not valid, please contact the author for assistance" });
    //   //   }else{
    //   //     return callback(false);
    //   //   }
    //   // }
  
    //   if(instance_id == undefined && res != undefined){
    //     if(res){
    //       return res.json({ status: 'error', message: "The Instance ID must be provided for the process to be completed" });
    //     }else{
    //       return callback(false);
    //     }
    //   }
  
    //   var team = await Common.db_get("sp_team", [{ids: access_token}]);
  
    //   if(!team){
    //     if(res){
    //       return res.json({ status: 'error', message: "The authentication process has failed" });
    //     }else{
    //       return callback(false);
    //     }
    //   }
  
    //   var session = await Common.db_get("sp_whatsapp_sessions", [ { instance_id: instance_id }, { team_id: team.id } ]);
  
    //   if(!session){
    //     Common.db_update("sp_accounts", [ { status: 0 }, { token: instance_id } ]);
  
    //     if(res){
    //       return res.json({ status: 'error', message: "The Instance ID provided has been invalidated" });
    //     }else{
    //       return callback(false);
    //     }
    //   }
  
    //   if(login){
    //     var SESSION_PATH = session_dir + instance_id;
    //     if (fs.existsSync(SESSION_PATH)) {
    //       rimraf.sync(SESSION_PATH);
    //     }
    //     delete sessions[ instance_id ];
    //     delete chatbots[ instance_id ];
    //     delete bulks[ instance_id ];
    //   }
  
    //   sessions[instance_id] = await WAZIPER.session(instance_id, false);
    //   return callback(sessions[instance_id]);
    // },

    // get_qrcode: async function(instance_id, res){
    //   var client = sessions[instance_id];
    //   if(client == undefined){
    //     return res.json({ status: 'error', message: "The WhatsApp session could not be found in the system" });
    //   }
  
    //   if(client.qrcode != undefined && !client.qrcode){
    //     return res.json({ status: 'error', message: "It seems that you have logged in successfully" });
    //   }
  
    //   //Check QR code exist
    //   for( var i = 0; i < 10; i++) {
    //     if( client.qrcode == undefined ){
    //       await Common.sleep(1000);
    //     }
    //   }
  
    //   if(client.qrcode == undefined || client.qrcode == false){
    //     return res.json({ status: 'error', message: "The system cannot generate a WhatsApp QR code" });
    //   }
  
    //   var code = qrimg.imageSync(client.qrcode, { type: 'png' });
    //   return res.json({ status: 'success', message: 'Success', base64: 'data:image/png;base64,'+code.toString('base64') });
    // },
  
    // get_info: async function(instance_id, res){
    //   var client = sessions[instance_id];
    //   if(client != undefined && client.user != undefined){
    //     if(client.user.avatar == undefined) await Common.sleep(1500);
    //     client.user.avatar = await WAZIPER.get_avatar( client );
    //     return res.json({ status: 'success', message: "Success", data: client.user });
    //   }else{
    //     return res.json({ status: 'error', message: "Error", relogin: true });
    //   }
    // },

    // waitForOpenConnection: async function(socket){
    //   return new Promise((resolve, reject) => {
    //     const maxNumberOfAttempts = 10
    //     const intervalTime = 200 //ms
  
    //     let currentAttempt = 0
    //     const interval = setInterval(() => {
    //       if (currentAttempt > maxNumberOfAttempts - 1) {
    //         clearInterval(interval)
    //         resolve(0)
    //       } else if (socket.readyState === socket.OPEN) {
    //         clearInterval(interval)
    //         resolve(1)
    //       }
    //       currentAttempt++
    //     }, intervalTime)
    //   })
    // },

    // send_message: async function(instance_id, access_token, req, res){
    //   var type = req.query.type;
    //   var chat_id =  req.body.chat_id;
    //   var media_url = req.body.media_url;
    //   var caption = req.body.caption;
    //   var filename = req.body.filename;
    //   var team = await Common.db_get("sp_team", [{ids: access_token}]);
  
    //   if(!team){
    //     return res.json({ status: 'error', message: "The authentication process has failed" });
    //   }
  
    //   item = {
    //     team_id: team.id,
    //     type: 1,
    //     caption: caption,
    //     media: media_url,
    //     filename: filename
    //   }
  
    //   await WAZIPER.auto_send(instance_id, chat_id, chat_id, "api", item, false, function(result){
    //           console.log(result);
    //     if(result){
    //       if(result.message != undefined){
    //         result.message.status = "SUCCESS";
    //       }
    //       return res.json({ status: 'success', message: "Success", "message": result.message });
    //     }else{
    //       return res.json({ status: 'error', message: "Error" });
    //     }
    //   });
    // },

}





setTimeout(() => {
  WAREAL.makeWASocket().then((res) => console.log(res))
}, 1000);






const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const useMongoDBAuthState = require("./mongoAuthState");
const makeWASocket = require("@whiskeysockets/baileys").default;
const mongoURL = "mongodb+srv://anmolsingh3445:anmolsingh3445@whatsappcluster.phjd5fq.mongodb.net/";
const { MongoClient } = require("mongodb");

const errorMappings = {
    401: 'loggedOut',
    403: 'forbidden',
    408: 'timedOut',
    411: 'multideviceMismatch',
    428: 'connectionClosed',
    440: 'connectionReplaced',
    500: 'badSession',
    503: 'unavailableService',
    515: 'restartRequired',
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
  };

async function connectionLogic() {
    const mongoClient = new MongoClient(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await mongoClient.connect();
    // const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const collection = mongoClient
      .db("whatsapp_api")
      .collection("auth_info_baileys");

    // const { state, saveCreds } = await useMongoDBAuthState(collection);

    let state, saveCreds;

    console.log("abcdddddddddddddddddddddddd")

    try {
      const authState = await useMongoDBAuthState(collection);

      console.log("authstateeeeeeeeeeeeeeeeeeeeeeeeeee", authState)

      state = authState.state;
      saveCreds = authState.saveCreds;
    } catch (error) {
      console.error('Failed to load authentication state:', error);
      // Handle corrupted data here (e.g., clear the collection)
      //   await collection.deleteMany({});
      state = {};
      saveCreds = async () => {}; // A no-op function in case of error
    }

    console.log("wxyzzzzzzzzzzzzzzzzzzzzzzzzzzzz")

    try {

        const sock = makeWASocket({
            // can provide additional config here
            printQRInTerminal: true,
            auth: state,
        });

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update || {};

            console.log("\n\n\n\n", connection, "\n\n\n\n", DisconnectReason, "\n\n\n\n", lastDisconnect)

            if (qr) {
                console.log(qr);
                // write custom logic over here
            }

            if (connection === "close") {
                const errorCode = lastDisconnect?.error?.output?.statusCode
                const reason = errorMappings[errorCode] || 'unknown'

                console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", errorCode, reason)

                if (reason === 'loggedOut') {
                    // Generate new QR code for re-authentication
                    state = {};
                    // connectionLogic();
                    console.log("logouttttttttttttttttttttt..........................")
                  } else if (reason === 'timedOut' || reason === 'connectionLost') {
                    // Attempt to reconnect
                    // connectionLogic();
                  }

                // const shouldReconnect =
                // lastDisconnect?.error?.output?.statusCode !==
                // DisconnectReason.loggedOut;

                // if (shouldReconnect) {
                //     connectionLogic();
                // }
            }
        });

        sock.ev.on("messages.update", (messageInfo) => {
            console.log(messageInfo);
        });

        sock.ev.on("messages.upsert", async(messageInfoUpsert) => {
            const id = '919546703057@s.whatsapp.net'

            const sentMsg  = await sock.sendMessage(id, { text: 'Hi testing 1' })

            console.log("Message Sentttttttttttttttttttttttt: ", sentMsg)

            console.log("Message: ", messageInfoUpsert?.messages[0]?.message?.extendedTextMessage?.text, messageInfoUpsert);
        });

        sock.ev.on("creds.update", saveCreds);

    } catch (err) {
        console.log("Errorrrrrrrrrrrrrrrrrrrrrrrrr: ", err)
    }

}

// connectionLogic();


































// const makeWASocket = require('@whiskeysockets/baileys').default
// const { DisconnectReason, useMultiFileAuthState} = require('@whiskeysockets/baileys')

// const mongoDBUrl = 'mongodb+srv://anmolsingh3445:anmolsingh3445@whatsappcluster.phjd5fq.mongodb.net/'

// async function connectionLogic() {
//     console.log("Helloooooooooooooooooooooooooooooo")

//     const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

//     const sock = makeWASocket ({
//         printQRInTerminal: true,
//         auth: state,
//     })

//     sock.ev.on('connection.update', async (update) => {
//         const { connection, lastDisconnect, qr } = update || {}

//         if(qr) {
//             console.log(qr)
//         }

//         if(connection === 'close') {
//             const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

//             if(shouldReconnect) {
//                 connectionLogic()
//             }
//         }
//     })

//     sock.ev.on('creds.update', saveCreds)
// }

// connectionLogic()




















// async function connectToWhatsApp () {
//     const sock = makeWASocket({
//         // can provide additional config here
//         printQRInTerminal: true
//     })
//     sock.ev.on('connection.update', (update) => {
//         const { connection, lastDisconnect } = update
//         if(connection === 'close') {
//             const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
//             console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
//             // reconnect if not logged out
//             if(shouldReconnect) {
//                 connectToWhatsApp()
//             }
//         } else if(connection === 'open') {
//             console.log('opened connection')
//         }
//     })
//     // sock.ev.on('messages.upsert', async m => {
//     //     console.log(JSON.stringify(m, undefined, 2))

//     //     console.log('replying to', m.messages[0].key.remoteJid)
//         // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
//     await sock.sendMessage('919546703057@s.whatsapp.net', { text: 'Hello there!' }) // send a simple text message

//     // })
// }
// // run in main file
// connectToWhatsApp()
