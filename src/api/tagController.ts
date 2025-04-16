// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /tag/add */
export async function addTag(body: API.TagAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/tag/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /tag/list */
export async function listTags(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTagVO>('/tag/list', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /tag/list/hot */
export async function listHotTags(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTagVO>('/tag/list/hot', {
    method: 'GET',
    ...(options || {}),
  })
}
