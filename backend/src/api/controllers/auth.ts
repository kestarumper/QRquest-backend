import { Request, Response, NextFunction } from "express";
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { User, IUser } from '../models/User';
import { sign } from 'jsonwebtoken';
import { addUser, getCurrentUserData, getUserPlacement } from "./users";

export type JSONWebToken = string;

// TODO: load keys from .env
const privateKey = 'cat';

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: privateKey,
}, function (jwt_payload, done) {
    getCurrentUserData(jwt_payload.data)
        .then((user: IUser) => {
            if (!user) {
                return done(null, false)
            };
            return done(null, user);
        })
        .catch((err) => {
            console.error(err);
            return done(err, false)
        })
}));

passport.use(new LocalStrategy(function (username: string, password: string, done) {
    User.findOne({ login: username })
        .select('password')
        .exec()
        .then((user: IUser) => {
            if (user === null) {
                addUser({
                    login: username,
                    password: password
                }).then((usr: IUser) => {
                    promiseSign(usr).then((token: JSONWebToken) => {
                        return done(null, { userid: usr._id, token });
                    });
                }).catch((reason) => {
                    return done(reason, false);
                })
            }
            else {
                user.validPassword(password).then((valid: boolean) => {
                    if (valid) {
                        promiseSign(user).then((token: JSONWebToken) => {
                            return done(null, { userid: user._id, token });
                        });
                    } else {
                        return done({ message: 'Nieprawidłowe dane lub użytkownik o takim loginie już istnieje.', status: 401 }, false);
                    }
                })
            }
        })
        .catch((reason) => {
            console.error(reason);
            return done(reason, false);
        })
}));

export function promiseSign(user: IUser): Promise<JSONWebToken> {
    return new Promise((resolve, reject) => {
        sign({
            data: user._id
        }, privateKey, {
                expiresIn: "12h"
            }, (err, token: JSONWebToken) => {
                if (err) { throw err; };
                resolve(token);
            });
    })
}

export function translateErrorMessage(errors): string | null {
    if(!errors) {
        return errors;
    }
    const dict: { [key: string]: string } = {
        "password": "Hasło musi zawierać conajmniej 8 znaków.",
        "login": "Login musi zawierać conajmniej 4 znaki. Niektóre znaki mogą być zabronione."
    }
    let translatedErrors = "";
    for(const error in errors) {
        if(dict[error]) {
            translatedErrors += dict[error] + " ";
        }
    }
    return translatedErrors;
}

export function requestTokenUsingUsernamePassword(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('local', function (err, data, info) {
        if (err) {
            res.status(err.status || 500).json({
                message: translateErrorMessage(err.errors) || err.message || err
            });
        } else if (data.token) {
            getCurrentUserData(data.userid).then((user: IUser) => {
                user = user.toObject();
                return getUserPlacement(user.login).then((place: number) => {
                    res.json({
                        token: data.token,
                        user: { ...user, place }
                    });
                })
            }).catch((reason) => {
                res.status(500).send(reason);
            })
        } else {
            res.status(401).json(info);
        }
    })(req, res, next);
}

export function logout(req: Request, res: Response, next: NextFunction): void {
    req.logout();
    res.status(200).send(`Zostałeś wylogowany.`);
}