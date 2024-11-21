type UserResponse = {
  name: string
  email: string
  sub: string
  picture: string
}

const URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export const getUserInfoFromGoogleApi = async (accessToken: string) => {
  const r = await fetch(URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const userInfo = (await r.json()) as UserResponse

  return userInfo
}
