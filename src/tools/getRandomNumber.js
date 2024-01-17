/**
 * 获取指定范围随机数
 * @param {number} m 随机数上限（可达）
 * @param {number} n 随机数下限（可达）
 * @returns 随机数
 */
export default function getRandomNumber(m, n){  
  return Math.floor(Math.random() * (m - n + 1)) + n;  
}