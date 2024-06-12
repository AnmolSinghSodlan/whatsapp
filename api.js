import WAREAL from "./wareal/wareal.js"

export default (app) => {
  // get new instance_id
  app.get('/create_instance', async (req, res) => {
    await WAREAL.generateInstanceId(res)
  })

  // get qr code
  app.get('/get_qrcode', async (req, res) => {
    let instance_id = req.query.instance_id

    // Include Login in the future
    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.get_qrcode(instance_id, res)
    })
  })

  // check whatsapp connection
  app.get('/instance', async (req, res) => {
    let instance_id = req.query.instance_id

    // Include Login in the future
    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.get_info(instance_id, res)
    })
  })

  app.get('/send', async (req, res) => {
    let number = req?.query?.number
    let type = req?.query?.type
    let message = req?.query?.message
    let instance_id = req?.query?.instance_id

    let data = { number, type, message }

    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.send_message(instance_id, data, res)
    })
  })

  // Discuss

  // app.get('/reboot', async (req, res) => {
  //   let instance_id = req.query.instance_id
  // })
  
  // const result = await WAREAL.instance(instance_id, res, async (client) => {
  //   await WAREAL.logout(instance_id, res);
  // });
}