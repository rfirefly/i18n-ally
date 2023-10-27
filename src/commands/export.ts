import path from 'path'
import { commands, window } from 'vscode'
import xlsx from 'node-xlsx'
import fse from 'fs-extra'
import { Commands } from './commands'
import { ExtensionModule } from '~/modules'
import { Analyst } from '~/core/Analyst'
import { Config, Global } from '~/core'

async function outputExcel() {
  const { missing } = await Analyst.analyzeUsage(false)
  const localeDirs = Global.localesPaths
  const rootPath = Global.rootpath
  const exportPath = localeDirs && localeDirs.length > 0 ? path.resolve(rootPath, localeDirs[0], '..') : path.resolve(rootPath, 'translate')

  const system = Config.excelSystem || 'oms'
  const keys = missing.map(item => item.keypath)

  const titleRow = ['系统', 'key', '中文']
  const data = keys.map(key => [system, key, key])

  const tableData = [titleRow, ...data]

  const buffer = xlsx.build([{ name: 'missing_keys', data: tableData, options: { '!cols': [{ wch: 20 }, { wch: 40 }, { wch: 40 }] } }])
  const outFile = path.resolve(exportPath, 'missing_keys.xlsx')
  const outFileJson = path.resolve(exportPath, 'missing_keys.json')
  const outFileText = path.resolve(exportPath, 'missing_keys.text')
  fse.outputFileSync(outFile, buffer)
  fse.outputFileSync(outFileJson, JSON.stringify(keys))
  fse.outputFileSync(outFileText, keys.join('\n'))
  window.showInformationMessage(`success output: ${outFile}`)
}

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.export_missing, outputExcel),
  ]
}
