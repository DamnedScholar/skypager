const runtime = require('@skypager/node')

const { defineTable, print } = runtime.cli

const docsTable = defineTable('docsTable', {
  head: ['Title', 'Owner', 'Last Modified', 'ID'],
})

module.exports = async function list(commands = [], options = {}) {
  const { google } = runtime

  await google.whenReady()

  if ((options.server && !google.auth) || (!options.server && !google.oauthClient)) {
    throw new Error(
      `Command requires an authenticated oauth client, or server to server auth setup`
    )
  }

  print(`Listing documents`)
  const items = await google.listDocuments({
    ...(!options.server && { auth: google.oauthClient }),
    ...options,
  })

  const records = items.map(doc => ({
    id: doc.id,
    title: doc.title,
    lastModifiedBy: doc.lastModifyingUserName,
    lastModifiedAt: doc.modifiedDate,
    owners: (doc.owners || []).map(owner => owner.displayName),
  }))

  if (options.json) {
    if (options.raw) {
      console.log(JSON.stringify(items, null, 2))
    } else {
      console.log(JSON.stringify(records, null, 2))
    }

    return
  }

  records.forEach(rec => {
    docsTable.push([
      rec.title,
      rec.owners.join('\n'),
      `${rec.lastModifiedBy}\n${rec.lastModifiedAt}`,
      rec.id,
    ])
  })

  console.log(docsTable.toString())
}
