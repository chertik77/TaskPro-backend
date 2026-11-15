import type { UploadApiResponse } from 'cloudinary'

import { cloudinary } from '@/config'

export const AVATAR_FOLDER = 'TaskPro/user_avatars'

const ALLOWED_IMAGE_FORMATS = ['jpg', 'png', 'webp', 'avif']

export const uploadToCloudinary = (file: Buffer, folder: string) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ALLOWED_IMAGE_FORMATS
        },
        (error, result) => {
          if (error || !result) return reject(error)

          resolve(result)
        }
      )
      .end(file)
  })

export const deleteFromCloudinary = async (
  publicId: string | null | undefined
) => {
  if (!publicId) return

  try {
    await cloudinary.uploader.destroy(publicId, {
      type: 'upload',
      resource_type: 'image'
    })
  } catch (error) {
    console.error('[cloudinary] Failed to delete asset', publicId, error)
  }
}
