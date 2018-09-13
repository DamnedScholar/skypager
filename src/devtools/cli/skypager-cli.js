#!/usr/bin/env node

const path = require('path')
const { existsSync } = require('fs')
const args = process.argv.slice(2)
const spawnSync = require('child_process').spawnSync
const script = args.shift()
const scriptFilename = `${script}.js`.replace(/\.js\.js/, '.js')
const localScriptPath = path.resolve(process.cwd(), 'scripts', scriptFilename)
const ourScriptPath = path.resolve(__dirname, 'scripts/', scriptFilename)

let scriptPath = existsSync(localScriptPath) ? localScriptPath : ourScriptPath

if (!existsSync(scriptPath)) {
  try {
    scriptPath = require.resolve(`@skypager/devtools/scripts/${scriptFilename}`)
  } catch (error) {}
}

if (!existsSync(scriptPath)) {
  console.error(
    `Could not find a script: ${script} in either the local project scripts/ folder, in @skypager/cli/scripts folder, or in @skypager/devtools/scripts folder`
  )
  process.exit(1)
}

try {
  const result = spawnSync('node', [scriptPath].concat(args), {
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  process.exit(result.status)
} catch (error) {
  process.exit(1)
}