// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addTag POST /api/tag/add */
export async function addTagUsingPost(body: API.TagAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/tag/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listHotTags GET /api/tag/list/hot */
export async function listHotTagsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTagVO_>('/api/tag/list/hot', {
    method: 'GET',
    ...(options || {}),
  })
}
