/* eslint-disable no-console */

const fs = require('fs');
const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const includePaths = require('rollup-plugin-includepaths');
const colors = require('colors/safe');
const typescript_plugin = require('rollup-plugin-typescript2');


module.exports = function buildSrc() {
    var cache;
    var building = false;
    return function () {
        if (building) return;

        // Start clean
        unlink('dist/iD.js');
        unlink('dist/iD.js.map');

        console.log('building src');
        console.time(colors.green('src built'));

        building = true;

        return rollup
            .rollup({
                input: './modules/id.js',
                plugins: [
                    typescript_plugin({
                        check: true
                    }),
                    includePaths({
                        paths: [
                            'node_modules/d3/node_modules' // for npm 2
                        ]
                    }),
                    nodeResolve({
                        module: true,
                        main: true,
                        browser: false
                    }),
                    commonjs({
                        namedExports: {
                            'node_modules/d3-geo/build/d3-geo.js': ['geoMercatorRaw', 'geoTransform', 'geoArea', 'geoBounds', 'geoPath', 'geoIdentity', 'geoStream', 'geoLength', 'geoCentroid'],
                            'node_modules/d3-zoom/build/d3-zoom.js': ['zoomIdentity', 'zoom'],
                            'node_modules/d3-dispatch/build/d3-dispatch.js': ['dispatch'],
                            'node_modules/d3-selection/dist/d3-selection.js': ['selection', 'select', 'mouse', 'event', 'customEvent', 'touches', 'selectAll'],
                            'node_modules/d3-ease/build/d3-ease.js': ['easeLinear'],
                            'node_modules/d3-polygon/build/d3-polygon.js': ['polygonCentroid', 'polygonHull'],
                            'node_modules/d3-scale/build/d3-scale.js': ['scaleQuantize'],
                            'node_modules/d3-interpolate/build/d3-interpolate.js': ['quantize', 'interpolateNumber', 'interpolate', 'interpolateRgb'],
                            'node_modules/d3-timer/build/d3-timer.js': ['timer', 'timeout'],
                            'node_modules/d3-array/build/d3-array.js': ['range', 'bisector', 'descending', 'ascending'],
                            'node_modules/d3-collection/build/d3-collection.js': ['set']

                        }
                    }),
                    json()
                ],
                cache: cache
            })
            .then(function (bundle) {
                cache = bundle;
                return bundle.write({
                    format: 'iife',
                    file: 'dist/iD.js',
                    sourcemap: true,
                    strict: false
                });
            })
            .then(function () {
                building = false;
                console.timeEnd(colors.green('src built'));
            })
            .catch(function (err) {
                building = false;
                cache = undefined;
                console.error(err);
                process.exit(1);
            });
    };
};


function unlink(f) {
    try {
        fs.unlinkSync(f);
    } catch (e) { /* noop */ }
}