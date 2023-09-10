const cron = require('node-cron')
const cleanupTask = require('./cleanupTask')

cron.schedule('0 2 * * *', function () {
  cleanupTask()
})
