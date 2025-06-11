// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /thumb/cancelThumb */
export async function cancelThumb(body: API.DoThumbRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/thumb/cancelThumb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /thumb/doThumb */
export async function doThumb(body: API.DoThumbRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/thumb/doThumb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /thumb/status */
export async function hasThumb(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.hasThumbParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/thumb/status', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
