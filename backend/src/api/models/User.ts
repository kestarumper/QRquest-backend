import { Document, Schema, Model, model } from 'mongoose';
import { IQRCode } from './QRCode';
import * as crypto from 'crypto'

export type HashedPassword = string;

export interface IValidatePassword {
    validPassword(password: string): Promise<boolean>
}

export interface IUserCreateProperties {
    login: string;
    password: string;
}

export interface IUser extends IUserCreateProperties, IValidatePassword, Document {
    lastScannedDate?: number
    name?: string;
    points?: number;
    qrcodes?: IQRCode[];
}

export const UserSchema: Schema = new Schema({
    login: {
        type: String,
        required: 'Wpisz login użytkownika.',
        unique: 'Login must be unique',
        minlength: 4,
        maxlength: 24,
        match: /^[a-zA-Z0-9_\-\.]*?[a-zA-Z0-9_\-]$/
    },
    password: {
        type: String,
        required: 'Wpisz hasło użytkownika.',
        minlength: 8,
        maxlength: 512
    },
    name: {
        type: String,
        default: "",
        maxlength: 24,
        match: /^[a-zA-Z0-9_\-\.]*?[a-zA-Z0-9_\-]$/
    },
    points: {
        type: Number,
        default: 0,
        min: [0, 'Points cannot be less than zero']
    },
    qrcodes: [
        { 
            type: Schema.Types.ObjectId,
            ref: 'QRCode'
        }
    ],
    lastScannedDate: {
        type: Number,
        default: Date.now
    }
});

function checkHashedPassword(password: string): Promise<boolean> {
    const user: IUser = this;
    return asyncHashPassword(password).then((hashedPwd: HashedPassword) => {
        return user.password === hashedPwd;
    })
}

function asyncHashPassword(pwd: string): Promise<HashedPassword> {
    return new Promise((resolve, reject) => {
        resolve(crypto.createHash('sha256').update(pwd).digest('base64'));
    });
}

UserSchema.methods.validPassword = checkHashedPassword;

UserSchema.pre('save', function(next) {
    const user: IUser = this as IUser;
    if(user.password) {
        asyncHashPassword(user.password)
        .then((hashedPwd: HashedPassword) => {
            user.password = hashedPwd;
        })
        .then(() => {
            return next();
        })
        .catch((reason) => {
            console.error(reason)
            return next(reason);
        })
    } else {
        return next()
    }
});

export const User: Model<IUser> = model<IUser>('User', UserSchema, 'User');