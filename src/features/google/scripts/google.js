const runtime = require('@skypager/node')

const calendars = require('./calendars')
const docs = require('./docs')
const files = require('./files')
const sheets = require('./sheets')
const utils = require('./utils')

main()

async function main() {
  const subcommand = runtime.argv._[0]
  const subcommands = runtime.argv._.slice(1)
  const options = runtime.argv
  const { clear, randomBanner, print } = runtime.cli

  if (!runtime.argv.json) {
    clear()
    randomBanner('Skypager')
    print('Google Integration CLI')
  }

  switch (subcommand) {
    case 'authorize':
      await utils.authorize(subcommands, {
        ...options,
        verbose: true,
      })
      process.exit(0)
      break

    case 'console':
      await utils.authorize([], options)
      await runtime.repl('interactive').launch({
        runtime,
        calendars,
        files,
        docs,
        sheets,
        utils,
      })
    case 'calendar':
    case 'calendars':
      await utils.authorize([], options)
      await calendars(subcommands, options)
      break

    case 'doc':
    case 'docs':
    case 'documents':
      await utils.authorize([], options)
      await docs(subcommands, options)
      break

    case 'files':
      await utils.authorize([], options)
      await files(subcommands, options)
      break

    case 'folders':
      await utils.authorize([], options)
      await files.folders(subcommands, options)
      break

    case 'sheets':
    case 'spreadsheets':
      await utils.authorize([], options)
      await sheets(subcommands, options)
      break

    default:
      utils.help(subcommands, options)
  }
}
