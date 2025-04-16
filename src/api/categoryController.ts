// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /category/add */
export async function addCategory(body: API.CategoryAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/category/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /category/list */
export async function listCategories(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCategoryVO>('/category/list', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /category/list/hot */
export async function listHotCategories(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCategoryVO>('/category/list/hot', {
    method: 'GET',
    ...(options || {}),
  })
}
