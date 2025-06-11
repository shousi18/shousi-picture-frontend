declare namespace API {
  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseCreateOutPaintingTaskResponse = {
    code?: number
    data?: CreateOutPaintingTaskResponse
    message?: string
  }

  type BaseResponseGetOutPaintingTaskResponse = {
    code?: number
    data?: GetOutPaintingTaskResponse
    message?: string
  }

  type BaseResponseInteger = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseListCategoryVO = {
    code?: number
    data?: CategoryVO[]
    message?: string
  }

  type BaseResponseListImageSearchResult = {
    code?: number
    data?: ImageSearchResult[]
    message?: string
  }

  type BaseResponseListInteger = {
    code?: number
    data?: number[]
    message?: string
  }

  type BaseResponseListPictureVO = {
    code?: number
    data?: PictureVO[]
    message?: string
  }

  type BaseResponseListSoImageSearchResult = {
    code?: number
    data?: SoImageSearchResult[]
    message?: string
  }

  type BaseResponseListSpace = {
    code?: number
    data?: Space[]
    message?: string
  }

  type BaseResponseListSpaceCategoryAnalyzeResponse = {
    code?: number
    data?: SpaceCategoryAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceLevel = {
    code?: number
    data?: SpaceLevel[]
    message?: string
  }

  type BaseResponseListSpaceSizeAnalyzeResponse = {
    code?: number
    data?: SpaceSizeAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceTagAnalyzeResponse = {
    code?: number
    data?: SpaceTagAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserAnalyzeResponse = {
    code?: number
    data?: SpaceUserAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserVO = {
    code?: number
    data?: SpaceUserVO[]
    message?: string
  }

  type BaseResponseListString = {
    code?: number
    data?: string[]
    message?: string
  }

  type BaseResponseListTagVO = {
    code?: number
    data?: TagVO[]
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseMapStringString = {
    code?: number
    data?: Record<string, any>
    message?: string
  }

  type BaseResponsePagePictureVO = {
    code?: number
    data?: PagePictureVO
    message?: string
  }

  type BaseResponsePageSpace = {
    code?: number
    data?: PageSpace
    message?: string
  }

  type BaseResponsePageSpaceVO = {
    code?: number
    data?: PageSpaceVO
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponsePicture = {
    code?: number
    data?: Picture
    message?: string
  }

  type BaseResponsePictureVO = {
    code?: number
    data?: PictureVO
    message?: string
  }

  type BaseResponseSpace = {
    code?: number
    data?: Space
    message?: string
  }

  type BaseResponseSpaceUsageAnalyzeResponse = {
    code?: number
    data?: SpaceUsageAnalyzeResponse
    message?: string
  }

  type BaseResponseSpaceUser = {
    code?: number
    data?: SpaceUser
    message?: string
  }

  type BaseResponseSpaceVO = {
    code?: number
    data?: SpaceVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type CategoryAddRequest = {
    categoryName?: string
  }

  type CategoryVO = {
    id?: number
    categoryName?: string
    totalNum?: number
    createTime?: string
  }

  type consumerMemberCodeParams = {
    code: string
  }

  type CreateOutPaintingTaskResponse = {
    output?: Output
    code?: string
    message?: string
    requestId?: string
  }

  type CreatePictureOutPaintingTaskRequest = {
    pictureId?: number
    parameters?: Parameters
  }

  type DeleteRequest = {
    id?: number
  }

  type DoThumbRequest = {
    pictureId?: number
  }

  type EmailCodeRequest = {
    email?: string
    type?: string
  }

  type ExchangeMemberRequest = {
    userId?: number
    code?: string
  }

  type getNameParams = {
    name: string
  }

  type GetOutPaintingTaskResponse = {
    requestId?: string
    output?: Output
  }

  type getPictureByIdParams = {
    id: number
  }

  type getPictureOutPaintingTaskParams = {
    taskId: string
  }

  type getPictureVOByIdParams = {
    id: number
  }

  type getSpaceByIdParams = {
    id: number
  }

  type getSpaceVOByIdParams = {
    id: number
  }

  type getUserByIdParams = {
    id: number
  }

  type getUserSignInRecordParams = {
    year: number
  }

  type getUserVOByIdParams = {
    id: number
  }

  type HandleInvitationRequest = {
    id?: number
    status?: number
  }

  type hasThumbParams = {
    pictureId: number
  }

  type ImageSearchResult = {
    thumbUrl?: string
    fromUrl?: string
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    vipExpireTime?: string
    vipCode?: string
    vipNumber?: number
    balance?: number
    shareCode?: string
    inviteUser?: number
    editTime?: string
    createTime?: string
    updateTime?: string
  }

  type OrderItem = {
    column?: string
    asc?: boolean
  }

  type Output = {
    taskId?: string
    taskStatus?: string
  }

  type PagePictureVO = {
    records?: PictureVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PagePictureVO
    searchCount?: PagePictureVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageSpace = {
    records?: Space[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageSpace
    searchCount?: PageSpace
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageSpaceVO = {
    records?: SpaceVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageSpaceVO
    searchCount?: PageSpaceVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageUserVO = {
    records?: UserVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageUserVO
    searchCount?: PageUserVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type Parameters = {
    angle?: number
    outputRatio?: string
    topOffset?: number
    bottomOffset?: number
    leftOffset?: number
    rightOffset?: number
    bestQuality?: boolean
    limitImageSize?: boolean
    addWatermark?: boolean
    xScale?: number
    yScale?: number
  }

  type Picture = {
    id?: number
    spaceId?: number
    reviewStatus?: number
    reviewMessage?: string
    reviewerId?: number
    reviewTime?: string
    url?: string
    thumbnailUrl?: string
    picColor?: string
    thumbCount?: number
    tagList?: TagVO[]
    category?: CategoryVO
    tagNames?: string[]
    categoryName?: string
    originUrl?: string
    name?: string
    introduction?: string
    picSize?: number
    picWidth?: number
    picHeight?: number
    picScale?: number
    picFormat?: string
    userId?: number
    createTime?: string
    editTime?: string
    updateTime?: string
    isDelete?: number
  }

  type PictureEditByBatchRequest = {
    pictureIdList?: number[]
    spaceId?: number
    nameRule?: string
    categoryId?: number
    tagIds?: number[]
  }

  type PictureEditClearRequest = {
    pictureId?: number
    spaceId?: number
  }

  type PictureEditRequest = {
    id?: number
    spaceId?: number
    name?: string
    introduction?: string
    categoryId?: number
    tagIds?: number[]
  }

  type PictureQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    reviewStatus?: number
    reviewMessage?: string
    reviewerId?: number
    reviewTime?: string
    name?: string
    introduction?: string
    categoryId?: number
    tagIds?: number[]
    picSize?: number
    picWidth?: number
    picHeight?: number
    picScale?: number
    picFormat?: string
    searchText?: string
    userId?: number
    spaceId?: number
    nullSpaceId?: boolean
    startEditTime?: string
    endEditTime?: string
  }

  type PictureReviewRequest = {
    id?: number
    reviewStatus?: number
    reviewMessage?: string
  }

  type PictureUpdateRequest = {
    id?: number
    spaceId?: number
    name?: string
    introduction?: string
    category?: string
    tags?: string[]
  }

  type PictureUploadByBatchRequest = {
    searchText?: string
    first?: number
    count?: number
    namePrefix?: string
  }

  type PictureUploadRequest = {
    id?: number
    fileUrl?: string
    picName?: string
    spaceId?: number
  }

  type PictureVO = {
    id?: number
    spaceId?: number
    reviewStatus?: number
    reviewMessage?: string
    reviewerId?: number
    reviewTime?: string
    permissionList?: string[]
    url?: string
    thumbnailUrl?: string
    picColor?: string
    name?: string
    introduction?: string
    tagList?: TagVO[]
    category?: CategoryVO
    picSize?: number
    picWidth?: number
    picHeight?: number
    picScale?: number
    picFormat?: string
    userId?: number
    createTime?: string
    updateTime?: string
    user?: UserVO
    thumbCount?: number
  }

  type SearchPictureByColorRequest = {
    picColor?: string
    spaceId?: number
  }

  type SearchPictureByPictureRequest = {
    pictureId?: number
  }

  type SoImageSearchResult = {
    imgUrl?: string
    title?: string
    imgkey?: string
    http?: string
    https?: string
  }

  type Space = {
    id?: number
    spaceName?: string
    spaceLevel?: number
    spaceType?: number
    maxSize?: number
    maxCount?: number
    totalSize?: number
    totalCount?: number
    userId?: number
    createTime?: string
    editTime?: string
    updateTime?: string
    isDelete?: number
  }

  type SpaceAddRequest = {
    spaceName?: string
    spaceLevel?: number
    spaceType?: number
  }

  type SpaceCategoryAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceCategoryAnalyzeResponse = {
    name?: string
    count?: number
    totalSize?: number
  }

  type SpaceEditRequest = {
    id?: number
    spaceName?: string
  }

  type SpaceLevel = {
    value?: number
    text?: string
    maxCount?: number
    maxSize?: number
  }

  type SpaceQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userId?: number
    spaceName?: string
    spaceLevel?: number
    spaceType?: number
  }

  type SpaceRankAnalyzeRequest = {
    topN?: number
  }

  type SpaceSizeAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceSizeAnalyzeResponse = {
    sizeRange?: string
    count?: number
  }

  type SpaceTagAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceTagAnalyzeResponse = {
    name?: string
    count?: number
  }

  type SpaceUpdateRequest = {
    id?: number
    spaceName?: string
    spaceLevel?: number
    maxSize?: number
    maxCount?: number
  }

  type SpaceUsageAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceUsageAnalyzeResponse = {
    usedSize?: number
    maxSize?: number
    sizeUsageRatio?: number
    usedCount?: number
    maxCount?: number
    countUsageRatio?: number
  }

  type SpaceUser = {
    id?: number
    spaceId?: number
    userId?: number
    spaceRole?: string
    inviteStatus?: number
    createUserId?: number
    createTime?: string
    updateTime?: string
  }

  type SpaceUserAddRequest = {
    spaceId?: number
    userId?: number
    spaceRole?: string
    inviteStatus?: number
    createUserId?: number
  }

  type SpaceUserAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
    userId?: number
    timeDimension?: string
  }

  type SpaceUserAnalyzeResponse = {
    period?: string
    count?: number
  }

  type SpaceUserEditRequest = {
    id?: number
    spaceRole?: string
    inviteStatus?: number
    createUserId?: number
  }

  type SpaceUserQueryRequest = {
    id?: number
    spaceId?: number
    userId?: number
    spaceRole?: string
    inviteStatus?: number
    createUserId?: number
  }

  type SpaceUserVO = {
    id?: number
    spaceId?: number
    userId?: number
    spaceRole?: string
    inviteStatus?: number
    createUserId?: number
    createTime?: string
    updateTime?: string
    user?: UserVO
    space?: SpaceVO
  }

  type SpaceVO = {
    id?: number
    spaceName?: string
    spaceLevel?: number
    spaceType?: number
    permissionList?: string[]
    maxSize?: number
    maxCount?: number
    totalSize?: number
    totalCount?: number
    userId?: number
    createTime?: string
    editTime?: string
    updateTime?: string
    user?: UserVO
  }

  type TagAddRequest = {
    tagName?: string
  }

  type TagVO = {
    id?: number
    tagName?: string
    totalNum?: number
    createTime?: string
  }

  type testDownloadFileParams = {
    filePath: string
  }

  type updateUserAvatarParams = {
    userUpdateRequest: UserUpdateRequest
  }

  type uploadPictureParams = {
    pictureUploadRequest: PictureUploadRequest
  }

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    email?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    vipExpireTime?: string
    vipCode?: string
    vipNumber?: number
    balance?: number
    shareCode?: string
    inviteUser?: number
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserAddRequest = {
    userName?: string
    userAccount?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserLoginRequest = {
    userAccountOrEmail?: string
    userPassword?: string
    verifyCode?: string
    verifyCodeId?: string
  }

  type UserQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    userAccount?: string
    email?: string
    code?: string
    userPassword?: string
    checkPassword?: string
  }

  type UserUpdateEmailRequest = {
    id?: number
    newEmail?: string
    code?: string
  }

  type UserUpdatePasswordRequest = {
    id?: number
    oldPassword?: string
    newPassword?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserVO = {
    id?: number
    userAccount?: string
    userName?: string
    email?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
    vipExpireTime?: string
    balance?: number
  }
}
