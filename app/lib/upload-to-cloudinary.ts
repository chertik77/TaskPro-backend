import cloudinary from '@/config'

type UploadInput = {
  file: string
  folder?: string
  public_id?: string
}

export async function uploadToCloudinary({
  file,
  folder = 'uploads',
  public_id
}: UploadInput) {
  const result = await cloudinary.uploader.upload(
    file,
    { folder, public_id, resource_type: 'auto' },
    err => {
      if (err) throw new Error('Cloudinary upload failed')
    }
  )

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format
  }
}
