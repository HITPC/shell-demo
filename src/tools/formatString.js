/**
 * 换行格式化字符串函数
 * @param {string} str 要转换的字符串
 * @returns 将字符串中的/\n/g替换为<br>后的字符串
 */
export default function formatString(str) {
  return str.replace(/\n/g, '<br>');
}