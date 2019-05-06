import { getQRCodesPointsSum } from "./qrcodes";
import { getUsersCount } from "./users";

export function allStats(req, res, next) {
    Promise.all([
        getQRCodesPointsSum(),
        getUsersCount()
    ]).then((data) => {
        res.json({
            totalPoints: data[0],
            totalUsers: data[1]
        });
    })
}