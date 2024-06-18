import { model, Schema, Types } from 'mongoose'

const sessionSchema = new Schema({ uid: Types.ObjectId }, { versionKey: false })

export const Session = model('session', sessionSchema)
