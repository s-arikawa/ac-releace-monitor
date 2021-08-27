import { CronJob } from 'cron'
import { useFileOperationService } from './fileOperationService'
import path from 'node:path'
import { useScrapingService } from './scrapingService'
import { AppleConfiguratorFunction } from '../types/acFunction'

export const useCronService = () => {
  /**
   * 定期的にジョブを実行します。
   * 設定は左から
   * 秒: 0-59
   * 分: 0-59
   * 時: 0-23
   * 日: 1-31
   * 月: 0-11
   * 週: 0-6
   *
   * 以下の処理を行います。
   * - 1つ前のファイル（before-latest.html）を削除
   * - 現時点で最新のファイル（latest.html）を1つ前のファイル（before-latest.html）としてリネームする
   * - Apple Configuration のサイトから HTML をダウンロードして latest.html として保存する
   * - latest.html と before-latest.html を比較する
   * - 差分がある場合は Apple Configurator 2 のリリースノートのページをスクレイピングして、最新情報を取得
   * - 最新情報をチャットに通知する
   *
   * 上記の処理に async/await を使わずに _sleep でお茶を濁しているのは手抜きです。
   */
  const cronJob = new CronJob('10 * * * * *', async () => {
    const appleConfiguratorUrl = 'https://support.apple.com/ja-jp/HT208040'
    const fileDownloadPath = path.join(`${process.cwd()}`, 'src', 'files')

    const { deleteFile, moveFile, downloadFile, diffFile } = useFileOperationService()

    // 1つ前のファイル（before-latest.html）を削除
    deleteFile(fileDownloadPath, 'before-latest.html')

    await _sleep(1000)

    // 現時点で最新のファイル（latest.html）を1つ前のファイル（before-latest.html）としてリネームする
    moveFile(fileDownloadPath, 'latest.html', fileDownloadPath, 'before-latest.html')

    await _sleep(1000)

    // Apple Configuration のサイトから HTML をダウンロードして latest.html として保存する
    downloadFile(appleConfiguratorUrl, fileDownloadPath, 'latest.html')

    await _sleep(20000)

    // latest.html と before-latest.html を比較する
    const diffResult = diffFile(
      fileDownloadPath,
      'latest.html',
      fileDownloadPath,
      'before-latest.html'
    )

    if (diffResult) {
      console.log('最新ファイルとの差分があります。')
      _scraping().then((acFunction: AppleConfiguratorFunction) => {
        // TODO: 変更をチャットに通知する
        console.log(acFunction.title)
      })
    } else {
      console.log('最新のファイルとの差分はありません。')
    }
  })

  const _sleep = async (milliSeconds: number) => {
    await new Promise((resolve) => setTimeout(resolve, milliSeconds))
  }

  const _scraping = async () => {
    const { getFirstNewFunctionH2FromACSite, getFirstNewFunctionDivFromACSite } =
      useScrapingService()
    const acNewFunctionH2 = await getFirstNewFunctionH2FromACSite().then((item) => item)
    const acNewFunctionDiv = await getFirstNewFunctionDivFromACSite().then((item) => item)
    const acFunction: AppleConfiguratorFunction = {
      title: acNewFunctionH2,
      functions: acNewFunctionDiv,
    }
    return acFunction
  }

  return {
    cronJob,
  }
}
