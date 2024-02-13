declare namespace Express {
  export interface Request {
    user: {
      _id: string
      name: string
      email: string
      avatarURL: {
        url: string
        publicId: string
      }
      userTheme: string
    }
  }
}
