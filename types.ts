export interface Feed {
  feedId: string
  content: FeedContent
  createTime: number
}

export interface FeedContent {
  publishTime: number
  location: string
  text: string
  images: FeedImage[]
  videos: FeedVideo[]
}

export interface FeedImage {
  imageUrl: string
  photoTime: number
  longitude: string
  latitude: string
}

export interface FeedVideo {
  videoUrl: string
  photoTime: number
}
