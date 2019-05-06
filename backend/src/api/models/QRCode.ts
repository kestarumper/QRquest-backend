import { Document, Schema, Model, model } from 'mongoose';

export interface IQRCode extends Document {
    hash: string;
    name: string;
    description: string;
    image: string;
    points: number;
}
export const QRCodeSchema: Schema = new Schema({
    hash: {
        type: String,
        default: (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)),
        required: 'Please enter unique hash of QRcode',
        unique: 'Hash must be unique',
        minlength: 8,
        maxlength: 24
    },
    name: {
        type: String,
        required: 'Please enter name of QRcode',
        minlength: 2,
        maxlength: 64
    },
    description: {
        type: String,
        default: "Nic ciekawego nie napisali o tym kodzie :(",
        minlength: 2,
        maxlength: 512,
    },
    image: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/6/6c/No_image_3x4.svg",
        // match: /.+\.(jpg|png|svg|jpeg|gif|JPG|PNG|SVG|JPEG|GIF)$/
    },
    points: {
        type: Number,
        default: 5,
        min: 0,
        max: 100
    }
});

export const QRCode: Model<IQRCode> = model<IQRCode>('QRCode', QRCodeSchema, 'QRCode');