import WAREAL from "./wareal/wareal.js"

export default (app) => {
  // get new instance_id
  app.get('/create_instance', async (req, res) => {
    await WAREAL.generateInstanceId(res)
  })

  // get qr code
  app.get('/get_qrcode', async (req, res) => {
    let instance_id = req.query.instance_id

    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.get_qrcode(instance_id, res)
    })
  })

  // check whatsapp connection
  app.get('/instance', async (req, res) => {
    let instance_id = req.query.instance_id

    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.get_info(instance_id, res)
    })
  })

  // send message
  app.post('/send', async (req, res) => {
    let number = req?.body?.number
    let type = req?.body?.type
    let message = req?.body?.message
    let media_url = req?.body?.media_url
    let instance_id = req?.body?.instance_id

    let data = { number, type, message, media_url }

    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.send_message(instance_id, data, res)
    })
  })

  // remove whatsapp connection
  app.get('/reboot', async (req, res) => {
    let instance_id = req.query.instance_id
  
    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.logout(instance_id, res)
    })
  })
}