import getRandomNumber from "./getRandomNumber";

// 获取大小写字母表
const upperCase = [];
const lowerCase = [];
for (let i = 0; i < 26; i++) {// 大写
  upperCase.push(String.fromCharCode(65 + i))
};

for (let i = 0; i < 26; i++) {// 小写
  lowerCase.push(String.fromCharCode(97 + i));
};

/**
 * 获取随机字符串
 * @param {number} length 字符串长度，默认为8
 * @param {boolean} mix 允许大小写混杂？默认为true
 * @param {boolean} onlyUpper 只是大写，在未设置mix为false的情况下将被屏蔽，默认为false
 * @param {boolean} onlyLower 只是小写，在未设置mix为false的情况下将被屏蔽，默认为false
 */
export default function getRandomStirng(length = 8, mix = true, onlyUpper = false, onlyLower = false){
  let res = "";
  if(mix){// 混杂大小写
    let bigOrLess;
    for(let i = 0; i < length; ++i){
      bigOrLess = getRandomNumber(0, 1);
      if(bigOrLess === 1){
        res += lowerCase[getRandomNumber(0, 25)];
      }else{
        res += upperCase[getRandomNumber(0, 25)];
      }
    }
    return res;
  }
  // 传参不合法
  if(onlyUpper && onlyLower){
    throw new Error("请检查传参是否正确，不允许onlyUpper和onlyLower同时为true。");
  }
  // 只大写
  if(onlyUpper){
    for(let i = 0; i < length; ++i){
      res += upperCase[getRandomNumber(0, 25)];
    }
    return res;
  }
  // 只小写
  if(onlyLower){
    for(let i = 0; i < length; ++i){
      res += lowerCase[getRandomNumber(0, 25)];
    }
    return res;
  }
}