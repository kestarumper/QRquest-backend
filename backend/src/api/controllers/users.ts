import { NextFunction, Request, Response } from "express";
import { User, IUser, IUserCreateProperties } from '../models/User';
import { promiseSign, JSONWebToken } from "./auth";

export function scoreboard(req: Request, res: Response, next: NextFunction): void {
    getScoreboard()
        .then((users: IUser[]) => {
            res.json(users);
        })
        .catch((reason) => {
            res.status(500).send(reason);
        })
}

export function getScoreboard(): Promise<IUser[]> {
    return User.find({})
        .select({
            login: 1,
            name: 1,
            points: 1,
            lastScannedDate: 1,
            _id: 0
        })
        .sort([
            ["points", -1],
            ["lastScannedDate", 1]
        ])
        .exec()
}

export function getUserPlacement(login: string): Promise<number> {
    return getScoreboard()
        .then((users: IUser[]) => {
            const userIndexes = [];
            for(const user of users) {
                userIndexes.push(user.login);
            }
            const placement = userIndexes.indexOf(login) + 1;
            return placement;
        })
}

export function getUsersCount(): Promise<number> {
    return User.count({}).exec();
}

export function getCurrentUserData(id: string): Promise<IUser> {
    return User.findById(id)
        .select({
            token: 0,
            password: 0,
        })
        .populate('qrcodes')
        .exec()
}

export function listUser(req: Request, res: Response, next: NextFunction): void {
    const user: IUser = (req.user as IUser).toObject();
    getUserPlacement(user.login).then((place: number) => {
        res.json({ ...user, place});
    }).catch((reason) => {
        console.error(reason);
        res.status(500).send(reason)
    })
}

export function addUser(body: IUserCreateProperties): Promise<IUser> {
    const newUser: IUser = new User(body);
    newUser.lastScannedDate = Date.now();
    return newUser.save().then(() => {
        return newUser;
    })
}

export function deleteUser(req: Request, res: Response, next: NextFunction): void {
    User.findOneAndRemove({
        _id: req.user._id
    })
        .then((doc: IUser) => {
            if (doc === null) {
                throw 'Object not found';
            }
            req.logout();
            res.sendStatus(200);
        })
        .catch((reason) => {
            res.status(404).send(reason);
        })
}

export function updateUser(req: Request, res: Response, next: NextFunction): void {
    const usr: IUser = req.user;
    usr.set(req.body);
    usr.save()
        .then((usr: IUser) => {
            res.redirect('/api/user')
        })
        .catch((reason) => {
            res.status(reason.status || 500).send(reason);
        })
}