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
