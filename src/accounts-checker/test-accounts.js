const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { loadAccountsFromCsv, writeAccountsToCsv } = require('../util')

async function shadowcheck () {
  await exec('python shadowcheck.py', { maxBuffer: 10 * 1024 * 1024, cwd: 'PGNumbra' })
}

async function loadCheckedAccounts () {
  const accounts = {}

  accounts.good = await loadAccountsFromCsv(`./PGNumbra/accounts-good.csv`)
  accounts.captcha = await loadAccountsFromCsv(`./PGNumbra/accounts-captcha.csv`)
  accounts.blind = await loadAccountsFromCsv(`./PGNumbra/accounts-blind.csv`)
  accounts.banned = await loadAccountsFromCsv(`./PGNumbra/accounts-banned.csv`)
  accounts.error = await loadAccountsFromCsv(`./PGNumbra/accounts-error.csv`)

  return accounts
}

async function testAccounts (accounts) {
  await writeAccountsToCsv(accounts, './PGNumbra/accounts.csv')
  await shadowcheck()
  return loadCheckedAccounts()
}

module.exports = testAccounts
