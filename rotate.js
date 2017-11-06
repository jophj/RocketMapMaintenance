const accountChecker = require('./src/accounts-checker')

const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  version: '0.0.1-lel',
  addHelp: true,
  description: 'Rotate accounts as best as it would'
})
parser.addArgument(
  [ '-p', '--pool-csv' ],
  {
    help: 'Accounts pool csv file'
  }
)
parser.addArgument(
  [ '-a', '--accounts-csv' ],
  {
    help: 'Accounts csv file. This file will be modified'
  }
)

const args = parser.parseArgs()
console.log(args)
