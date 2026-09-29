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
  const result = await cloudinary.uploader.upload(file, {
    folder,
    public_id,
    resource_type: 'auto'
  })

  return result
}
