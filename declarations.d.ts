declare namespace Express {
  export interface Request {
    user: {
      id: string
      name: string
      email: string
      avatar: {
        url: string
        publicId: string
      }
      theme: string
    }
  }
}
