const path = require('path')
const fs = require('fs')
const multer = require('multer')
const express = require('express')
const router = express.Router()

//import PDFkit
var PDFDocument = require('pdfkit')
const session = require('express-session')

const MulterStore = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]
    )
  },
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
})

//configuration for file filter
const fileFilter = (req, file, callback) => {
  let ext = path.extname(file.originalname)
  //if the file extension isn't '.png' or '.jpg' return an error page else return true
  if (ext !== '.png' && ext !== '.jpg') {
    return callback(new Error('Only png and jpg files are accepted'))
  } else {
    return callback(null, true)
  }
}

//initialize Multer with the configurations for storage and file filter
const upload = multer({ storage: MulterStore, fileFilter: fileFilter })

/* GET home page. */
router.get('/', function (req, res, next) {
  //if there are no image filenames in a session, return the normal HTML page
  if (req.session.imagefiles === undefined) {
    res.sendFile(path.join(__dirname, '..', '/public/html/index.html'))
  } else {
    //if there are image filenames stored in a session, render them in an index.jade file
    res.render('index', { images: req.session.imagefiles })
  }
})

// upload files
router.post('/upload', upload.array('images'), function (req, res, next) {
  let files = req.files
  let imgNames = []

  //extract the filenames
  for (i of files) {
    imgNames.push(i['filename'])
  }
  //store the image filenames in a session
  req.session.imagefiles = imgNames

  //redirect the request to the root URL route
  res.redirect('/')
})

router.post('/pdf', function (req, res, next) {
  let body = req.body

  //Create a new pdf
  let doc = new PDFDocument({ size: 'A4', autoFirstPage: false })
  let pdfName = 'pdf-' + Date.now() + '.pdf'

  //store the pdf in the public/pdf folder
  doc.pipe(
    fs.createWriteStream(path.join(__dirname, '..', `/public/pdfs/${pdfName}`))
  )

  //create the pdf pages and add the images
  for (let name of body) {
    doc.addPage()
    doc.image(path.join(__dirname, '..', `/public/images/${name}`), 20, 20, {
      width: 555.28,
      align: 'center',
      valign: 'center',
    })
  }
  //end the process
  doc.end()

  //send the address back to the browser
  res.send(`/pdfs/${pdfName}`)
})

router.get('/new', function (req, res, next) {
  //delete the files stored in the session

  let filenames = req.session.imagefiles
  req.session.destroy((err) => {
    let deleteFiles = async (paths) => {
      let deleting = paths.map((file) =>
        fs.promises.unlink(path.join(__dirname, '..', `/public/images/${file}`))
      )
      await Promise.all(deleting)
    }
    deleteFiles(filenames)

    res.redirect('/') // will always fire after session is destroyed
  })
})

module.exports = router
