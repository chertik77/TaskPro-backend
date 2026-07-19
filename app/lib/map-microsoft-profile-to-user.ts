import type { MicrosoftEntraIDProfile, User } from 'better-auth'

import { prisma } from '@/prisma'

import cloudinary from '@/config'

import { uploadToCloudinary } from './upload-to-cloudinary'

export const mapMicrosoftProfileToUser = async (
  profile: MicrosoftEntraIDProfile
): Promise<Partial<User>> => {
  const email = profile.email ?? profile.preferred_username ?? profile.upn

  if (!email) throw new Error('Microsoft profile has no email')

  const user = await prisma.user.findUnique({
    where: { email: profile.email }
  })

  let image: string | undefined
  let imagePublicId: string | undefined

  if (profile.picture) {
    const uploadedImage = await uploadToCloudinary({
      file: profile.picture.trim().replace(/\s/g, ''),
      folder: 'TaskPro/user_avatars'
    })

    image = uploadedImage.url
    imagePublicId = uploadedImage.public_id

    if (user?.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId, {
        type: 'upload',
        resource_type: 'image'
      })
    }
  }

  return {
    email,
    ...(image && { image }),
    ...(imagePublicId && { imagePublicId })
  }
}
