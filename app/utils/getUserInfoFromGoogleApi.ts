type UserResponse = {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
}

const URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export const getUserInfoFromGoogleApi = async (accessToken: string) => {
  const r = await fetch(URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const userInfo = (await r.json()) as UserResponse

  return userInfo
}
