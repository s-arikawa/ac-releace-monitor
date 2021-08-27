import * as https from 'https'
import * as fs from 'fs'
import path from 'node:path'
import { diffLines } from 'diff'

export const useFileOperationService = () => {
  /**
   * ファイルを削除します。
   * @param dir 削除対象のファイルが存在するディレクトリ
   * @param fileName ファイル名
   */
  const deleteFile = (dir: string, fileName: string) => {
    const filePath = path.join(dir, fileName)
    if (fs.existsSync(filePath)) {
      console.log('ファイルを削除します。', filePath)
      fs.unlinkSync(filePath)
    }
  }

  /**
   * ファイルを移動します。
   * @param oldDir 移動前のディレクトリ
   * @param oldFileName 移動前のファイル名
   * @param newDir 移動後のディレクトリ
   * @param newFileName 移動後のファイル名
   */
  const moveFile = (oldDir: string, oldFileName: string, newDir: string, newFileName: string) => {
    const oldFilePath = path.join(oldDir, oldFileName)
    const newFilePath = path.join(newDir, newFileName)
    if (fs.existsSync(oldFilePath)) {
      fs.rename(oldFilePath, newFilePath, (error) => {
        if (error) throw error
        console.log(`ファイルを移動しました。 ${oldFilePath} -> ${newFilePath}`)
      })
    }
  }

  /**
   * ファイルをダウンロードします。
   * @param url ダウンロード元のURL
   * @param dir ダウンロード先のディレクトリ
   * @param fileName ダウンロードするファイル名
   */
  const downloadFile = (url: string, dir: string, fileName: string) => {
    const filePath = path.join(dir, fileName)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    console.log('ファイルをダウンロードします。', filePath)
    const file = fs.createWriteStream(filePath)
    file
      .on('open', () => {
        https.get(url, (res) => {
          res.setEncoding('utf-8')
          res.pipe(file)
        })
      })
      .on('finish', () => {
        file.close()
      })
      .on('error', (error) => {
        fs.unlink(filePath, () => {
          console.error(filePath + ' is closed by error.', error.message)
        })
      })
  }

  /**
   * ファイルの差分を取得します。
   * @param firstFileDir
   * @param firstFileName
   * @param secondFileDir
   * @param secondFileName
   * @return 差分がある場合は true | 差分がない場合は false
   */
  const diffFile = (
    firstFileDir: string,
    firstFileName: string,
    secondFileDir: string,
    secondFileName: string
  ) => {
    const firstFilePath = path.join(firstFileDir, firstFileName)
    const secondFilePath = path.join(secondFileDir, secondFileName)

    if (!fs.existsSync(firstFilePath) || !fs.existsSync(secondFilePath)) {
      return ''
    }
    console.log('以下のファイルの diff を取得します。')
    console.log(`${firstFilePath}`)
    console.log(`${secondFilePath}`)

    const firstFileContents = fs.readFileSync(firstFilePath, 'utf-8')
    const secondFileContents = fs.readFileSync(secondFilePath, 'utf-8')

    const diff = diffLines(firstFileContents, secondFileContents)

    let lines: string = ''
    diff.forEach((part) => {
      const line = part.added ? '+' + part.value : part.removed ? '-' + part.value : ''
      lines += line + '\n'
    })

    return lines.trim() !== ''
  }
  return {
    deleteFile,
    moveFile,
    downloadFile,
    diffFile,
  }
}
