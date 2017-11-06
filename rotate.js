const accountsChecker = require('./src/accounts-checker')
const loadAccountsFromCsv = require('./src/util').loadAccountsFromCsv

const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  version: '0.0.1-lel',
  addHelp: true,
  description: 'Rotate accounts as best as it would'
})
parser.addArgument(
  [ '-p', '--pool-csv' ],
  {
    required: true,
    help: 'Accounts pool csv file'
  }
)
parser.addArgument(
  [ '-a', '--accounts-csv' ],
  {
    required: true,
    help: 'Accounts csv file. This file will be modified'
  }
)

const args = parser.parseArgs()

async function Main (args) {
  const accountsToCheck = await loadAccountsFromCsv(args.accounts_csv)
  const accounts = await accountsChecker.test(accountsToCheck)
  console.log(accounts)
}

Main(args)
  .then()
  .catch()
