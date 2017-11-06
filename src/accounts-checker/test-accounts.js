const util = require('util')
const writeFile = util.promisify(require('fs').writeFile)
const exec = util.promisify(require('child_process').exec)
const loadAccountsFromCsv = require('../util').loadAccountsFromCsv

function removeDuplicates (accounts) {
  const map = new Map(accounts.map(a => [a.username, a]))
  return Array.from(map.values())
}

async function shadowcheck () {
  const { stderr } = await exec('python shadowcheck.py', { cwd: 'PGNumbra' })
  console.log('stderr:', stderr)
}

async function loadCheckedAccounts () {
  const accounts = {}

  accounts.good = await loadAccountsFromCsv(`./PGNumbra/accounts-good.csv`)
  console.log(`Found ${accounts.good.length} good accounts`)
  accounts.captcha = await loadAccountsFromCsv(`./PGNumbra/accounts-captcha.csv`)
  console.log(`Found ${accounts.captcha.length} captcha accounts`)
  accounts.blind = await loadAccountsFromCsv(`./PGNumbra/accounts-blind.csv`)
  console.log(`Found ${accounts.blind.length} blind accounts`)
  accounts.banned = await loadAccountsFromCsv(`./PGNumbra/accounts-banned.csv`)
  console.log(`Found ${accounts.banned.length} banned accounts`)
  accounts.error = await loadAccountsFromCsv(`./PGNumbra/accounts-error.csv`)
  console.log(`Found ${accounts.error.length} error accounts`)

  return accounts
}

async function testAccounts (accounts) {
  const accountsNoDupicates = removeDuplicates(accounts)
  const csvRows = accountsNoDupicates.map(a => `${a.provider || 'ptc'},${a.username},${a.password}`)
  await writeFile('./PGNumbra/accounts.csv', csvRows.join('\n'))

  // await shadowcheck()
  await loadCheckedAccounts()
}

module.export = testAccounts
