const { createApp } = require('../dist/server.js')

const app = createApp()

module.exports = (req, res) => app(req, res)
