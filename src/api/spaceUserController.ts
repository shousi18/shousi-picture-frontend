// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /spaceUser/add */
export async function addSpaceUser(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/spaceUser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /spaceUser/delete */
export async function deleteSpaceUser(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/spaceUser/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /spaceUser/edit */
export async function editSpaceUser(
  body: API.SpaceUserEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/spaceUser/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /spaceUser/get */
export async function getSpaceUser(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUser>('/spaceUser/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /spaceUser/handleInvitation */
export async function handleInvitation(
  body: API.HandleInvitationRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/spaceUser/handleInvitation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /spaceUser/invitations */
export async function getPendingInvitations(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO>('/spaceUser/invitations', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /spaceUser/list */
export async function listSpaceUser(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceUserVO>('/spaceUser/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /spaceUser/list/my */
export async function listMyTeamSpace(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO>('/spaceUser/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
