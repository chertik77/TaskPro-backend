import type { MicrosoftEntraIDProfile } from 'better-auth'

import { prisma } from '@/prisma'

import { AVATAR_FOLDER, uploadToCloudinary } from './cloudinary'

export const mapMicrosoftProfileToUser = async (
  profile: MicrosoftEntraIDProfile
) => {
  const email = profile.email ?? profile.preferred_username ?? profile.upn

  if (!email) throw new Error('Microsoft profile has no email')

  if (!profile.picture) return { email }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true }
  })

  if (existingUser) return { email }

  const base64 = profile.picture.slice(profile.picture.indexOf(',') + 1)

  const uploadedImage = await uploadToCloudinary(
    Buffer.from(base64, 'base64'),
    AVATAR_FOLDER
  )

  return {
    email,
    image: uploadedImage.secure_url,
    imagePublicId: uploadedImage.public_id
  }
}
