'use strict'

const fs = require('fs')
const del = require('del')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const pkg = require('../package.json')

const BUILD_DIR = 'build'

// Clean up the output directory

let promise = Promise.resolve()

// Clean up the output directory
promise = promise.then(() => del([`${BUILD_DIR}/*`]))

// Compile source code into a distributable format with Babel

promise.then(() => rollup.rollup({
  input: 'lib/router.js',
  external: Object.keys(pkg.dependencies),
  plugins: [babel({
    exclude: 'node_modules/**',
    sourceMaps: true
  })]
}).then(bundle => bundle.write({
  file: 'build/cherrytree.js',
  format: 'es',
  sourcemap: true
})))

// Copy package.json and LICENSE.txt
promise = promise.then(() => {
  delete pkg.private
  delete pkg.devDependencies
  delete pkg.scripts
  delete pkg.standard
  delete pkg.babel
  fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(pkg, null, '  '), 'utf-8')
  fs.writeFileSync(`${BUILD_DIR}/LICENSE`, fs.readFileSync('LICENSE', 'utf-8'), 'utf-8')
  fs.writeFileSync(`${BUILD_DIR}/README.md`, fs.readFileSync('README.md', 'utf-8'), 'utf-8')
  fs.writeFileSync(`${BUILD_DIR}/CHANGELOG.md`, fs.readFileSync('CHANGELOG.md', 'utf-8'), 'utf-8')
})

promise.catch(err => {
  console.error(err.stack) // eslint-disable-line no-console
  process.exit(1)
})
