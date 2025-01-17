const path = require('path')
const fs = require('fs')
const url = require('url')
const { isEmpty, isArray } = require('lodash')
const runtime = require('@skypager/node')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(runtime.cwd)
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

const manifest = require(resolveApp('package.json'))
const projectConfig = Object.assign(
  {},
  manifest.skypager || {},
  (manifest.skypager && manifest.skypager.webpack && manifest.skypager.webpack) || {},
  runtime.argv
)

const envPublicUrl = process.env.PUBLIC_URL

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/')
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1)
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`
  } else {
    return inputPath
  }
}

const getPublicUrl = appPackageJson => envPublicUrl || require(appPackageJson).homepage

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson)
  const servedUrl = envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/')

  return ensureSlash(servedUrl.replace(/\/index.html$/i, ''), true)
}

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
]

let lessModulePaths = projectConfig.lessModulePaths || []

const appEntry = projectConfig.appEntry || 'src/launch'
const frameworkEntry = projectConfig.frameworkEntry || 'src/index'

if (!isEmpty(lessModulePaths)) {
  if (isArray(lessModulePaths)) {
    lessModulePaths = lessModulePaths.map(p => resolveApp(...p.split('/')))
  } else {
    lessModulePaths = resolveApp(...lessModulePaths.split('/'))
  }
}

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  )

  if (extension) {
    return resolveFn(`${filePath}.${extension}`)
  }

  return resolveFn(`${filePath}.js`)
}

module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(projectConfig.buildFolder || 'lib'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, appEntry).replace(/\.js\.js$/, '.js'),
  frameworkIndexJs: resolveModule(resolveApp, frameworkEntry).replace(/\.js\.js$/, '.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
  lessModulePaths,
}

if (fs.existsSync(resolveApp('docs'))) {
  module.exports.docsFolder = resolveApp('docs')
}

module.exports.moduleFileExtensions = moduleFileExtensions
