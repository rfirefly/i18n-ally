import path from 'path'
import axios from 'axios'
import { Config } from '../Config'
import { Log } from '~/utils/Log'
import { File } from '~/utils/File'

export class RemoteLoader {
  constructor(
    public readonly rootpath: string,
  ) {
    Log.info(`[Remote Loader] ${rootpath}`)
  }

  async init(path: string) {
    if (!path) return
    await this.loadRemoteLoalesData(path)
  }

  public async loadRemoteLoalesData(dir: string) {
    const localesApis = Config.localesApis
    const remoteDirPath = dir

    const getKey = (obj: object, val: any) => {
      const pair = Object.entries(obj).find(p => p[1] === val)
      if (!pair) return ''
      return pair[0]
    }

    if (!localesApis) return false
    for (const [locale, apiMap] of Object.entries(localesApis)) {
      const apis = Object.values(apiMap)
      Log.info(`🚀 loading remote locales from: "${apis.join(', ')}"`)
      const resList = await Promise.all(apis.map((api: string) => axios.get(api, { responseType: 'json' })))
      resList.forEach((res) => {
        if (res.status === 200) {
          let basename = getKey(apiMap, res.config.url)

          basename = `${locale}.${basename}-remote.json` // zh-CN.common.json
          const filePath = path.join(remoteDirPath, basename)
          const data: string = typeof res.data === 'string' ? res.data : JSON.stringify(res.data.data.translate, null, 2)
          Log.info(`🚀 output remote locales to: "${filePath}"`)

          File.writeSync(filePath, data)
        }
      })
    }
  }
}
