import { saveAs } from 'file-saver'

/**
 * 格式化文件大小
 */
export const formatFileSize = (fileSize: number) => {
  if (!fileSize) return '未知'
  if (fileSize < 1024) return fileSize + 'B'
  if (fileSize < 1024 * 1024) return (fileSize / 1024).toFixed(2) + 'KB'
  if (fileSize < 1024 * 1024 * 1024 * 1024) return (fileSize / 1024 / 1024).toFixed(2) + 'MB'
  if (fileSize < 1024 * 1024 * 1024 * 1024 * 1024) return (fileSize / 1024 / 1024 / 1024).toFixed(2) + 'GB'
}

export const downloadImage = (url: string, fileName: string) => {
  if(!url) {
    return
  }
  saveAs(url, fileName)
}
