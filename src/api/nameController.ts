// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** getName GET /api/name/get */
export async function getNameUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getNameUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/name/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
