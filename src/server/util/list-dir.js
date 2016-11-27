'use strict';

const path = require('path');
const recursive = require('recursive-readdir');

module.exports.recursive = function getFileList(dir, ext) {

    return new Promise((resolve, reject) => {

        recursive(dir, function (err, files) {
            if (err) return reject(err);

            // Filter .*** files
            resolve(files.filter(f => (path.extname(f) === ext)));
        });
    });
}