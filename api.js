import WAREAL from "./wareal/wareal.js"

export default (app) => {
  // get new instance_id
  app.get('/create_instance', async (req, res) => {
    const response = await WAREAL.generateInstanceId(res)
    res.json(response);
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
}