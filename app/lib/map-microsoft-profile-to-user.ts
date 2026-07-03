import type { MicrosoftEntraIDProfile, User } from 'better-auth'

import { prisma } from '@/prisma'

import cloudinary from '@/config'

import { uploadToCloudinary } from './upload-to-cloudinary'

export const mapMicrosoftProfileToUser = async (
  profile: MicrosoftEntraIDProfile
): Promise<Partial<User>> => {
  const user = await prisma.user.findUnique({
    where: { email: profile.email }
  })

  const cleanedBase64 = profile.picture.trim().replace(/\s/g, '')

  const uploadedImage = await uploadToCloudinary({
    file: cleanedBase64,
    folder: 'TaskPro/user_avatars'
  })

  if (user?.imagePublicId) {
    await cloudinary.uploader.destroy(user.imagePublicId, {
      type: 'upload',
      resource_type: 'image'
    })
  }

  return {
    email: profile.email ?? profile.preferred_username ?? profile.upn,
    image: uploadedImage.url,
    // @ts-expect-error it exists
    imagePublicId: uploadedImage.public_id
  }
}
