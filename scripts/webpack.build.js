process.env.NODE_ENV = 'production'

var ora = require('ora')
var path = require('path')
var chalk = require('chalk')
var febs = require('febs');
var fs = require('fs');
var webpack = require('webpack')
var webpackConfig = require('./webpack.config.js')
var webpackConfigMin = require('./webpack.config.min.js')

var packageJson = require('../package.json');
var dir = 'febsui-'+packageJson.version;

var spinner = ora('building for production...')
spinner.start()

var root = path.resolve(__dirname, '../');
var febs = require('febs');
febs.file.fileRemove(path.join(root, `dist/${dir}/README.md`));
febs.file.fileRemove(path.join(root, `dist/${dir}/demo.html`));
febs.file.dirRemoveRecursive(path.join(root, `dist/${dir}/icons`));
// febs.file.fileCopy(path.join(root, 'febsui.css'),         path.join(root, `dist/${dir}/febsui.css`));
// febs.file.fileCopy(path.join(root, 'febsui-icon.css'),    path.join(root, `dist/${dir}/febsui-icon.css`));
febs.file.fileCopy(path.join(root, 'README.md'),          path.join(root, `dist/${dir}/README.md`));
febs.file.fileCopy(path.join(root, 'dist/index.html'),    path.join(root, `dist/${dir}/demo.html`));
febs.file.dirCopy(path.join(root, 'resource/icons'),    path.join(root, `dist/${dir}/icons`));

function buildSrc(config) {
  return new Promise((resolve,reject)=>{
    webpack(config, function (err, stats) {
      if (err) {
        reject(err);
        return;
      }
      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n')
      resolve();
    });
  });
}

// start.
buildSrc(webpackConfig('browser/index.build.js', 'febsui.js', 'dist/'+dir))
.then(()=>buildSrc(webpackConfigMin('browser/index.build.js', 'febsui.min.js', 'dist/'+dir))) 
.then(()=>{
  spinner.stop()

  febs.file.fileCopy(path.join(root, 'package-dist.json'),    path.join(root, `dist/${dir}/package.json`));

  // 等待文件flush到磁盘.
  spinner.start();
  formatDotDefault();
  
  setTimeout(function() {
    febs.file.fileRemove(path.join(root, 'febsui.css'));
    febs.file.fileCopy(path.join(root, `dist/${dir}/febsui.css`), path.join(root, 'febsui.css'));
    spinner.stop()
    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  }, 1000);
})
.catch(err=>{
  console.log(err);
  spinner.stop();
});

/**
* @desc: 修改js中的.default 兼容ie.
* @return: 
*/
function formatDotDefault() {

  var assetsRoot = path.join(root, `dist/${dir}`);

  // 查找所有css.
  var alljs = febs.file.dirExplorerFilesRecursive(assetsRoot);
  for (var i = 0; alljs && i < alljs.length; i++) {
    alljs[i] = path.join(assetsRoot, alljs[i]);
    if (febs.file.fileIsExist(alljs[i])) {
      var buf = fs.readFileSync(alljs[i], 'utf-8');
      if (buf) {
        buf = febs.string.replace(buf, '.default ', '[\'default\'] ');
        buf = febs.string.replace(buf, '.default.', '[\'default\'].');
        buf = febs.string.replace(buf, '.default=', '[\'default\']=');
        buf = febs.string.replace(buf, '.default)', '[\'default\'])');
        buf = febs.string.replace(buf, '{ default:', '{ \'default\':');

        buf = febs.string.replace(buf, '.return ', '[\'return\'] ');
        buf = febs.string.replace(buf, '.return.', '[\'return\'].');
        buf = febs.string.replace(buf, '.return=', '[\'return\']=');
        buf = febs.string.replace(buf, '.return)', '[\'return\'])');

        buf = febs.string.replace(buf, '.catch(', '[\'catch\'](');

        fs.writeFileSync(alljs[i], buf);
      }
    }
  }
}
