const accountsChecker = require('./src/accounts-checker')
const { loadAccountsFromCsv, writeAccountsToCsv } = require('./src/util')

const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  version: '0.0.1-lel', // TODO
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
parser.addArgument(
  [ '-c', '--count' ],
  {
    help: 'Accounts to be present in ACCOUNT_CSV file after the rotation'
  }
)
parser.addArgument(
  [ '-b', '--batch-size' ],
  {
    defaultValue: 5,
    help: 'Pool\'s accounts check batch size. Higher values are faster but can result in checking more accounts than needed'
  }
)

const args = parser.parseArgs()

async function Main (args) {
  const accountsToCheck = await loadAccountsFromCsv(args.accounts_csv)
  let accounts = {
    good: [],
    captcha: [],
    blind: [],
    banned: [],
    error: []
  }
  console.log(`Checking status of ${accountsToCheck.length} accounts...`)
  if (accountsToCheck.length > 0) {
    const timer = setInterval(() => process.stderr.write('.'), 1000)
    accounts = await accountsChecker.test(accountsToCheck)
    clearInterval(timer)
  }
  console.log(`Found ${accounts.good.length} good accounts`)
  console.log(`Found ${accounts.captcha.length} captcha accounts`)
  console.log(`Found ${accounts.blind.length} blind accounts`)
  console.log(`Found ${accounts.banned.length} banned accounts`)
  console.log(`Found ${accounts.error.length} error accounts`)

  const batchSize = parseInt(args.batch_size)
  const poolChecked = {
    good: [],
    captcha: [],
    blind: [],
    banned: [],
    error: []
  }
  let pool = null
  let count = parseInt(args.count) - accounts.good.length
  if (count > 0) {
    console.log(`Searching for ${count} good accounts from the pool`)
    pool = await loadAccountsFromCsv(args.pool_csv)
    while (count > 0 && pool.length > 0) {
      const poolToCheck = pool.splice(0, batchSize)
      const timer = setInterval(() => process.stderr.write('.'), 1000)
      const checked = await accountsChecker.test(poolToCheck)
      clearInterval(timer)
      poolChecked.good = poolChecked.good.concat(checked.good)
      poolChecked.captcha = poolChecked.captcha.concat(checked.captcha)
      poolChecked.blind = poolChecked.blind.concat(checked.blind)
      poolChecked.banned = poolChecked.banned.concat(checked.banned)
      poolChecked.error = poolChecked.error.concat(checked.error)

      count -= checked.good.length
    }

    console.log(`Checked ${poolChecked.good.length + poolChecked.captcha.length + poolChecked.blind.length + poolChecked.banned.length + poolChecked.error.length} accounts from the pool`)
    console.log(`Found ${poolChecked.good.length} good accounts`)
    console.log(`Found ${poolChecked.captcha.length} captcha accounts`)
    console.log(`Found ${poolChecked.blind.length} blind accounts`)
    console.log(`Found ${poolChecked.banned.length} banned accounts`)
    console.log(`Found ${poolChecked.error.length} error accounts`)

    if (count > 0 && pool.length === 0) {
      console.log('Pool size not large enough. Only', accounts.good.length + poolChecked.good.length, 'good accounts')
    }
  }

  if (pool) {
    await writeAccountsToCsv(pool, args.pool_csv)
  }

  const blind = accounts.blind.concat(poolChecked.blind)
  await writeAccountsToCsv(blind, args.accounts_csv.replace('.csv', '-blind.csv'))

  const trash = accounts.banned
    .concat(accounts.captcha)
    .concat(accounts.error)
    .concat(poolChecked.banned)
    .concat(poolChecked.captcha)
    .concat(poolChecked.error)
  await writeAccountsToCsv(trash, args.accounts_csv.replace('.csv', '-trash.csv'))

  const good = accounts.good.concat(poolChecked.good)
  await writeAccountsToCsv(good, args.accounts_csv)
}

Main(args)
  .then()
  .catch()
