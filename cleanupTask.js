const path = require('path')
const fs = require('fs')

function deleteAllFiles(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdir(folderPath, (err, files) => {
      if (err) throw err

      // Loop through all files and delete them
      for (const file of files) {
        fs.unlink(`${folderPath}/${file}`, (err) => {
          if (err) throw err
          console.log(`Deleted file: ${file}`)
        })
      }
    })
  } else {
    console.log('Directory does not exist.')
  }
}

function cleanupTask() {
  console.log('Cleaning up images and pdfs directory')
  const imagesPath = path.join(__dirname, '/public/images')
  console.log(imagesPath)
  deleteAllFiles(imagesPath)

  const pdfsPath = path.join(__dirname, 'public/pdfs')
  console.log(pdfsPath)
  deleteAllFiles(pdfsPath)
}

module.exports = cleanupTask
