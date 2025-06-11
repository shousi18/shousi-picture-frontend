// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /member/create_vip_code */
export async function createVipCode(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString>('/member/create_vip_code', {
    method: 'POST',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /member/list_vip_code */
export async function listVipCode(body: API.MemberQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseIPageMember>('/member/list_vip_code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
