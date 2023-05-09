const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/gloader.js'),
      name: 'gloader',
      fileName: (format) => `gloader.${format}.js`
    }
  }
});