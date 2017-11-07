const util = require('util')
const writeFile = util.promisify(require('fs').writeFile)

function removeDuplicates (accounts) {
  const map = new Map(accounts.map(a => [a.username, a]))
  return Array.from(map.values())
}

async function writeAccountsToCsv (accounts, csvFile) {
  const accountsNoDupicates = removeDuplicates(accounts)
  const csvRows = accountsNoDupicates.map(a => `${a.provider || 'ptc'},${a.username},${a.password}`)
  await writeFile(csvFile, csvRows.join('\n'))
}

module.exports = writeAccountsToCsv
