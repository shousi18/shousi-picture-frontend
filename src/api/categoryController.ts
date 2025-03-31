// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addCategory POST /api/category/add */
export async function addCategoryUsingPost(
  body: API.CategoryAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/category/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listHotCategories GET /api/category/list/hot */
export async function listHotCategoriesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCategoryVO_>('/api/category/list/hot', {
    method: 'GET',
    ...(options || {}),
  })
}
