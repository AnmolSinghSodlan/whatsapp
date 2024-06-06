const { makeWASocket } = require('@whiskeysockets/baileys').default
const { DisconnectReason, useMultiFileAuthState} = require('@whiskeysockets/baileys')

async function connectionLogic() {
    console.log("Helloooooooooooooooooooooooooooooo")

    const [ state, saveCreds ] = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket ({
        printQRInTerminal: true,
        auth: state,
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update || {}

        if(qr) {
            console.log(qr)
        }

        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if(shouldReconnect) {
                connectionLogic()
            }
        }
    })
}

connectionLogic()




















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