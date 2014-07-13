///<reference path='../ts/node/mongoose.d.ts' />
///<reference path='../ts/node/node.d.ts' />

import path = require('path');
import mongoose = require('mongoose');


var imageSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    isLogo: { type: Boolean, default: false }
});

export interface iImage {
    originalName: string;
    type: string;
    name: string;
    isLogo: boolean;
    url: string;
}

imageSchema.virtual('url').get(function() {
    return '/upload/' + this.name;
});

export var Img = mongoose.model('Image', imageSchema);

