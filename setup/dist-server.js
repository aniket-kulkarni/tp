var browserSync = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback');

var colors = require('colors');

console.log('Running production server'.blue);

browserSync({
  port: 3000,
  ui: {
    port: 3001
  },
  server: {
    baseDir: 'dist'
  },

  files: [
    'src/*.html'
  ],

  middleware: [historyApiFallback()]
});
