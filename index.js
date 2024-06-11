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
