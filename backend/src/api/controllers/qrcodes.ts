import { NextFunction, Request, Response } from "express";
import { QRCode, IQRCode } from '../models/QRCode';
import { Document, Types } from 'mongoose';
import { User, IUser } from "../models/User";

export function addQRCodeToUser(req: Request, res: Response, next: NextFunction): void {
    // TODO: Refactor
    try {
        let user: IUser;
        let code: IQRCode;
        Promise.all([
            userExists(req.user._id),
            qrcodeExists(req.body.id)
        ]).then((vals: any[]) => {
            user = vals[0];
            code = vals[1];
            return userHasCode(user, code);
        }).then((val: boolean) => {
            if (val === true) {
                throw new Error(`Ten kod został już przez Ciebie zeskanowany.`);
            } else {
                user.qrcodes.push(code);
                user.points += code.points;
                user.lastScannedDate = Date.now();
                return user.save()
            }
        }).then(() => {
            res.status(200).json(code);
        }, (reason) => {
            res.status(500).json({
                message: reason.message
            });
        }).catch((reason: any) => {
            throw reason;
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

}

function validateObjectID(id: string): boolean {
    id = `${id}`
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return true
    } else {
        return false
    }
}

function userHasCode(user: IUser, code: IQRCode): Promise<boolean> {
    return new Promise((resolve) => {
        const index = user.qrcodes.indexOf(code.id);
        resolve(index >= 0);
    });
}

function userExists(id: string): Promise<IUser> {
    if (!validateObjectID(id)) {
        throw new Error(`Użytkownik o ID: ${id} nie istnieje.`)
    }
    return User.findById(id)
        .select({
            password: 0,
        })
        .exec()
        .then((user: IUser) => {
            if (user === null) {
                throw new Error(`Użytkownik o ID: ${id} nie istnieje.`)
            }
            return user;
        });
}

function qrcodeExists(hash: string): Promise<IQRCode> {
    return QRCode.findOne({ hash: hash }).exec()
        .then((code: IQRCode) => {
            if (code === null) {
                throw new Error(`Kod QR o id: "${hash}" nie istnieje.`)
            }
            return code;
        });
}

export function listUserQRCodes(req: Request, res: Response, next: NextFunction): void {
    const user: IUser = req.user;
    res.json(user.qrcodes);
}

export function addQRCode(req: Request, res: Response, next: NextFunction): void {
    const newQRCode: Document = new QRCode(req.body);
    newQRCode.save()
        .then(() => {
            res.sendStatus(200);
        })
        .catch((reason) => {
            res.status(500).send(reason);
        })
}

export function deleteQRCode(req: Request, res: Response, next: NextFunction): void {
    QRCode.findOneAndRemove({
        _id: req.params.id
    })
        .then((doc: Document) => {
            if (doc === null) {
                throw 'Object not found';
            }
            res.sendStatus(200);
        })
        .catch((reason) => {
            res.status(404).send(reason);
        })
}

export function updateQRCode(req: Request, res: Response, next: NextFunction): void {
    QRCode.findById(req.params.id)
        .then((qrcode: Document) => {
            if (qrcode === null) {
                throw 'Object not found';
            }
            qrcode.set(req.body);
            return qrcode.save();
        })
        .then(() => {
            res.sendStatus(200);
        })
        .catch((reason) => {
            res.status(404).send(reason);
        })
}

export function getQRCodesPointsSum(): Promise<number> {
    return QRCode.find({}).select('points').lean().exec()
        .then((codes: IQRCode[]) => {
            return codes.map(code => code.points).reduce((prev, curr) => prev + curr);
        })
}