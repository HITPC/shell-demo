import { ERROR_NOMATCH, ERROR_NOTRECOGNIZE, EXEC_SUCCESSFULLY } from "./ConstResults";
import setTheme from '../tools/setTheme'
import getRandomStirng from "../tools/getRandomString";
import getCommandManual from "./commandManual";

class CommandList{
  constructor(){
    this.commandList = [
      {
        HEAD: 'help',
        TARGET: [],
        DECORATION: [],
        SYMBOL: [],
        HandlerFunc: () => { // 要求传参命令对象和自己，省的自己再find一下
          // 此函数应该返回一个`shellItems`对象
          return {
            id: getRandomStirng(),
            type: 'info',
            value: `😊Welcome to use this shell! Here is the instructions for it.
            Okay, it's more like a list of currently supported commands than a manual📖.
            (🤫For myself: Remember to come back and update this list after the update!)
            [1] The current version does not support switching between previously entered commands by clicking the up and down keys😭. But this will be supported in the next update🤗.
            [2] Here is the COMMAND LIST:
            ${getCommandManual()}`
          }
        }
      },
      {
        HEAD: 'changetheme',
        TARGET: ['dark', 'light'],
        DECORATION: [],
        SYMBOL: [],
        HandlerFunc: (commandObject, itemSelf) => {
          if(commandObject.commandTARGET.length > 1){
            return ERROR_NOTRECOGNIZE;
          }
          if(commandObject.commandTARGET.length === 0){
            let localTheme = localStorage.getItem('theme');
            if(localTheme === 'light'){
              localStorage.setItem('theme', 'dark');
              setTheme('dark');
            }else{
              localStorage.setItem('theme', 'light');
              setTheme('light');
            }
            return EXEC_SUCCESSFULLY;
          }
          if(!itemSelf.TARGET.includes(commandObject.commandTARGET[0])){
            return ERROR_NOTRECOGNIZE;
          }
          localStorage.setItem('theme', commandObject.commandTARGET[0]);
          setTheme(commandObject.commandTARGET[0]);
          return EXEC_SUCCESSFULLY;
        }
      },
      {
        HEAD: 'about',
        TARGET: [],
        DECORATION: [],
        SYMBOL: [],
        HandlerFunc: (commandObject, itemSelf) => {
          return  {
            id: getRandomStirng(),
            type: 'info',
            value: `🙂Hi there! Welcome to use this shell-like! Input commands below👇to use this! 
            🔎If you don't know what commands you can use, please type [<strong>help</strong>] then type [Enter] to view the command list! 
            🛠 Build with Vue3 & Vite. 
            🚩Version<span class="cmd-SYMBOL-part-text">@1.0.0 beta</span>.
            🖍 Written by PiaoChen, all rights reserved. (Still updating at random time😘).
            🔗Code of this shell repository address: <a href="https://gitee.com/piao-chen/shell-demo" class="cmd-SYMBOL-part-text" target="_blank">Click me!</a>
            `
          };
        }
      },
      // {
      //   HEAD: 'clear',
      //   TARGET: [],
      //   DECORATION: [],
      //   SYMBOL: [],
      //   HandlerFunc: (commandObject, itemSelf) => {
      //     // 现在这种设计模式下，这玩意有点不好实现呐
      //     return  EXEC_SUCCESSFULLY;
      //   }
      // }
      {
        HEAD: 'aboutme',
        TARGET: [],
        DECORATION: [],
        SYMBOL: [],
        HandlerFunc: (commandObject, itemSelf) => {
          return  {
            id: getRandomStirng(),
            type: 'info',
            value: `Hello there, 😁I'm PiaoChen, a college student from Harbin Institute of Technology Weihai Campus. I really enjoy web front-end technology and plan to become a front-end development engineer. Nice to meet you and let's make progress together!😜
            🔗My personal website address: <a href="http://47.115.214.223" class="cmd-SYMBOL-part-text" target="_blank">Click me to [Piaochen's Square of Heaven and Earth]</a>
            🍗My JueJin page address:  <a href="https://juejin.cn/user/231345509892520" class="cmd-SYMBOL-part-text" target="_blank">Click me to [Piaochen's JueJin page]</a>
            📦My Gitee address: <a href="https://gitee.com/piao-chen" class="cmd-SYMBOL-part-text" target="_blank">Click me to [Piaochen's Gitee page]</a>(Github need some kind of magic, so I prefer Gitee😣)
            `
          };
        }
      },
      {
        HEAD: 'compute',
        TARGET: [],
        DECORATION: ['add', 'subtract', 'multiply', 'divide'],
        SYMBOL: [],
        HandlerFunc: (commandObject, itemSelf) => {
          if(commandObject.commandTARGET.length !== 2 || commandObject.commandDECORATION.length !== 1){
            return ERROR_NOTRECOGNIZE;
          }
          let nums = [];
          for(let item of commandObject.commandTARGET){
            let num = Number.parseFloat(item)
            if(num === NaN){
              return {
                id: getRandomStirng(),
                type: 'error',
                value: "[ERROR: NOT_RECOGNIZE] Please ensure that all operands are numbers."
              }
            }
            nums.push(num);
          }
          let res;
          let method = commandObject.commandDECORATION[0].substring(1);
          let signal;
          switch(method){
            case 'add':{
              res = nums[0] + nums[1];
              signal = '+';
              break;
            }
            case 'subtract':{
              res = nums[0] - nums[1];
              signal = '-';
              break;
            }
            case 'multiply':{
              res = nums[0] * nums[1];
              signal = '×';
              break;
            }
            case 'divide':{
              res = nums[0] / nums[1];
              signal = '÷';
              break;
            }
          }
          return  {
            id: getRandomStirng(),
            type: 'success',
            value: `[SUCCESS] The result of ${nums[0]} ${signal} ${nums[1]} is ${Number.isInteger(res) ? res : res.toFixed(2)}`
          };
        }
      }
    ];
  }
}

export default new CommandList();