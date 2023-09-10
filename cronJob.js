const cron = require('node-cron')
const cleanupTask = require('./cleanupTask')

cron.schedule('*/2 * * * *', function () {
  cleanupTask()
})
