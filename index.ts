import { doExif, downloadAsset, getImageOriginUrl, outputMd } from './utils'
import fse from 'fs-extra'
import path from 'path'
import * as dotenv from 'dotenv'
import { exiftool } from 'exiftool-vendored'
import { getNewFeeds } from './services'
import dayjs from 'dayjs'
import { Feed } from 'types'

// exiftool.version().then(version => console.log(`We're running ExifTool v${version}`))

dotenv.config()

const dist = process.env.DIST ?? ''

main()

async function main() {
  if (!fse.pathExistsSync(dist)) {
    fse.ensureDirSync(dist)
  }

  const newFeeds = await getNewFeeds()

  if (newFeeds.length === 0) {
    console.log(`everything is up-to-date!`)
    return
  }

  for (const feed of newFeeds) {
    await processFeed(feed)
  }

  exiftool.end()
}

async function processFeed(feed: Feed) {
  // 创建日期文件夹
  const feedTs = dayjs(feed.createTime).format('YYYYMMDD-HHmmss')
  // console.log(feedTs)
  const feedPath = path.join(dist, feedTs)
  if (!fse.pathExistsSync(feedPath)) {
    fse.ensureDirSync(feedPath)
  }
  const feedContent = feed.content
  const images = feedContent.images ?? []
  const videos = feedContent.videos ?? []
  const text = feedContent.text ?? ''

  for (const image of images) {
    const filePath = await downloadAsset(getImageOriginUrl(image), feedPath)
    await doExif(filePath, image.photoTime)
  }
  for (const video of videos) {
    const filePath = await downloadAsset(video.videoUrl, feedPath)
    await doExif(filePath, video.photoTime)
  }
  fse.outputFileSync(
    path.join(feedPath, 'readme.md'),
    outputMd({
      date: feedTs,
      content: text,
      images: images.map(image => getImageOriginUrl(image)),
      videos: videos.map(video => video.videoUrl)
    })
  )
  console.log(`${feedTs} archived!`)
}
