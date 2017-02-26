'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const unzip = require('unzip');
const csv = require('fast-csv');
const stream = require('stream');
const readline = require('readline');

const PATH_UNZIP_FILES = path.join(__dirname, '../ticks');

var count = 0;

module.exports = function (zipPath) {

    let instrument = zipPath.split('/')[zipPath.split('/').length - 2],
        oZipDate = _.last(zipPath.split('_')).replace('T', '').split('.')[0],
        fileName = `${oZipDate.substring(0, 4)}-${oZipDate.substring(4, 6)}`,
        outputPath = `${createTickDir(instrument)}/${fileName}`;

    // Check if file exists
    // TODO: Do quality check
    if (fs.existsSync(outputPath)) {
        //return Promise.resolve();
    }

    return new Promise((resolve, reject) => {

        fs.createReadStream(zipPath)
            .pipe(unzip.Parse())
            .on('entry', entry => {

                // Only want csv files
                if (path.extname(entry.path) !== '.csv') {
                    return entry.autodrain();
                }



                //entryToBinary(entry, outputPath, resolve, reject);
                entryToCSV(entry, outputPath, resolve, reject);

                if (++count % 100000 === 0) {
                    message({ticks: count}, 'Transformed: ' + count + ' rows')
                }


            })
            .on('error', reject);
    });
};

function entryToBinary(entry, outputPath, resolve, reject) {
    outputPath = outputPath + '.bin';

    let rows = [];

    readline
        .createInterface({
            input: entry,
            terminal: false
        })
        .on('line', line => {
            let parts = line.split(',');

            // if (fileName === '2016-01.bin' && count++ === 0) {
            //     console.log(getDate(parts[0]));
            // }

            rows.push([
                getDate(parts[0]),
                parts[1],
                parts[2]
            ]);

            if (++count % 100000 === 0) {
                message({ticks: count}, 'Transformed: ' + count + ' rows')
            }
        })
        .on('close', () => {
            console.log('end');

            let ws = fs.createWriteStream(outputPath);
            let rowLength = 3;
            let counter = 0;

            ws.on('finish', resolve);
            ws.on('error', reject);

            let buffer = new Buffer(rowLength * rows.length * Float64Array.BYTES_PER_ELEMENT);

            rows.forEach(function (row, i) {

                row.forEach(function(cell, i2) {

                    buffer.writeDoubleLE(cell, counter++ * Float64Array.BYTES_PER_ELEMENT);
                })
            });

            ws.write(buffer);

            ws.end();
        })
        .on('error', reject);
}

function entryToCSV(entry, outputPath, resolve, reject) {
    outputPath = outputPath + '.csv';
    try {
        console.log('asdf')
        readline
            .createInterface({
                input: entry,
                terminal: false
            })
            .on('line', line => {
                //let parts = line.split(',');

                // if (fileName.split('/') === '2016-01.bin' && count++ === 0) {
                //     console.log(getDate(parts[0]));
                // }

                entry.pipe(csv())
                    .transform(transformRow)
                    .pipe(csv.createWriteStream({headers: false}))
                    .pipe(fs.createWriteStream(outputPath))
                    .end(() => {
                        console.log('end')
                    })


                if (++count % 100000 === 0) {
                    message({ticks: count}, 'Transformed: ' + count + ' rows')
                }
            })
            .on('close', () => {

            })
            .on('error', reject);
    } catch(err) {
        console.error(err);
    }

}

function getDate(date) {
    let year = date.slice(0, 4),
        month = date.slice(4, 6),
        day = date.slice(6, 8),
        hour = date.slice(9, 11),
        minute = date.slice(11, 13),
        second = date.slice(13, 15),
        micro = date.slice(15, 18);

    let dateObj = new Date(`${year}${month}${day}${hour}${minute}${second}${micro}`);
    //let dateObj = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}:${micro}`);

    // Unix timestamp..
    let unixTime = dateObj.getTime();

    return unixTime;
}

function transformRow(data) {
    if (++count % 100000 === 0) {
        console.log('Transformed: ' + count + ' rows');
    }

    data[0] = getDate(data[0]);

    // Remove trailing zero
    data.pop();

    return data;
}

function createTickDir(instrument) {
    let tickPath = `${PATH_UNZIP_FILES}/${instrument}`;

    !fs.existsSync(tickPath) && fs.mkdirSync(tickPath);

    return tickPath;
}

function message(_process, _console) {
    if (process.send) {
        if (typeof _process == 'object') {
            _process = JSON.stringify(_process);
        }

        return process.send(_process);
    }
}

// FilePath
if (process.argv[2]) {
    module
        .exports(process.argv[2].split('=')[1])
        .then(() => message({ticks: count}) && process.exit(0))
        .catch(err => {
            throw new Error(err)
        })
}