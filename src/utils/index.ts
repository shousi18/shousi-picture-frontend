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

/**
 * 转换为16进制颜色
 * @param input
 */
export function toHexColor(input) {
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}
