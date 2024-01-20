/**
 * 检查字符串中内容是否全是空格
 * @param {string} content 要检查的字符串
 * @returns 
 */
export default function checkAllSpaces(content) {
    var regex = /^\s*$/; // 正则表达式，^表示开头，\s*表示0或多个空白字符，$表示结尾
    return regex.test(content);
}