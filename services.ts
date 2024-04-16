import { Feed } from 'types'
import got from 'got'
import * as dotenv from 'dotenv'
import { readData, writeData } from './db'

dotenv.config()

const REQ = JSON.parse(process.env.REQUEST_BODY ?? '')

export async function getLatestFeeds(): Promise<Feed[]> {
  try {
    // @ts-ignore
    const { body } = await got
      .post('https://api.szy.cn/growthproxy/gardentime/downrefresh/v1.0', {
        json: REQ
      })
      .json()

    return body.feeds ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getOtherFeeds(feedId: string): Promise<Feed[]> {
  try {
    // @ts-ignore
    const { body } = await got
      .post('https://api.szy.cn/growthproxy/gardentime/uprefresh/v1.0', {
        json: { ...REQ, feedId }
      })
      .json()

    return body.feeds ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getNewFeeds(): Promise<Feed[]> {
  const oldFeedIds = await readData()
  let newFeeds: Feed[] = []
  try {
    const latestFeeds = await getLatestFeeds()
    // 过滤掉已经存在的 feed
    const filteredLatestFeeds = latestFeeds.filter(feed => !oldFeedIds.includes(feed.feedId))

    // 已经获取到全部最新的 feed 了
    if (filteredLatestFeeds.length < latestFeeds.length) {
      // 写入数据
      writeData(filteredLatestFeeds.map(feed => feed.feedId))
      return filteredLatestFeeds
    }

    newFeeds.push(...latestFeeds)

    let feedId = latestFeeds[latestFeeds.length - 1]?.feedId ?? ''
    let otherFeeds: Feed[] = []
    let filteredOtherFeeds: Feed[] = []
    do {
      otherFeeds = await getOtherFeeds(feedId)

      filteredOtherFeeds = otherFeeds.filter(feed => !oldFeedIds.includes(feed.feedId))

      if (filteredOtherFeeds.length < otherFeeds.length) {
        newFeeds.push(...filteredOtherFeeds)
        break
      }

      feedId = otherFeeds[otherFeeds.length - 1]?.feedId ?? ''
      newFeeds.push(...otherFeeds)
    } while (otherFeeds.length > 0)

    writeData(newFeeds.map(feed => feed.feedId))
    return newFeeds
  } catch (error) {
    console.error(error)
    return []
  }
}
