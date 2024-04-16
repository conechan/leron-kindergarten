import * as dotenv from 'dotenv'
import fse from 'fs-extra'
import path from 'path'

dotenv.config()

const dist = process.env.DIST ?? ''
const filename = path.join(dist, 'db.txt')

// 写入数据到文件
export async function writeData(feedIds: string[]): Promise<void> {
  if (feedIds.length === 0) {
    console.log('No Data to be written.')
    return
  }
  const lines = feedIds.join('\n') + '\n'
  try {
    await fse.appendFile(filename, lines, {
      encoding: 'utf8'
    })
    console.log('Data has been written to the file.')
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

export async function readData(): Promise<string[]> {
  try {
    const data = await fse.readFile(filename, 'utf8')
    return data.split('\n').filter(feed => feed)
  } catch (error) {
    return []
  }
}
