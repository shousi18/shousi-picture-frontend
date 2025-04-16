// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /name/get */
export async function getName(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getNameParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/name/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
