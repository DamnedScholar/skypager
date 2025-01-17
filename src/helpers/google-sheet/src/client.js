export const interfaceMethods = ['listSheets', 'showFullSheet', 'showWorksheet']

export function listSheets(query = {}) {
  return this.client.get(`/sheets`, { query }).then(r => r.data)
}

export function showFullSheet(sheetKey, query = {}) {
  return this.client.get(`/sheets/${sheetKey}`, { query }).then(r => r.data)
}

export function showWorksheet(sheetKey, worksheetKey, query = {}) {
  return this.client.get(`/sheets/${sheetKey}/worksheetKey`, { query }).then(r => r.data)
}
