import multer from 'multer'

const storage = multer.diskStorage({
  filename: (_, file, cb) => {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniquePrefix}_${file.originalname}`)
  }
})

export const upload = multer({ storage })
