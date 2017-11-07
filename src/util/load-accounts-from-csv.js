const util = require('util')
const readFile = util.promisify(require('fs').readFile)

function parseCsv (accountsCsv) {
  return accountsCsv.trim().split('\n').map(r => r.split(',')).map(t => ({ provider: t[0], username: t[1], password: t[2] }))
}

async function loadAccounts (csvFile) {
  try {
    const fileContent = await readFile(csvFile)
    const accountsCsv = fileContent.toString()
    return parseCsv(accountsCsv)
  } catch (e) {
    return []
  }
}

module.exports = loadAccounts
