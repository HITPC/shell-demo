<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import setTheme from './tools/setTheme'
  import getRandomString from './tools/getRandomString'
  import formatString from './tools/formatString'
  import { HEAD, HANDLETYPE, DECORATION, TARGET, SYMBOL, INIT } from "./consts/InputStates"
  import ShellStatesRecord from './tools/ShellStatesRecord'
  // 初始化自动配置主题
  onMounted(()=>{
    let localTheme = localStorage.getItem('theme')
    if(!localTheme){
      localTheme.setItem('theme', 'light')
      localTheme = 'light'
    }
    setTheme(localTheme);
  }); 
  function changeTheme(){
    let localTheme = localStorage.getItem('theme')
    if(localTheme === 'light'){
      localStorage.setItem('theme', 'dark')
      setTheme('dark')
    }else{
      localStorage.setItem('theme', 'light')
      setTheme('light')
    }
  }
  // input的内容，注意，input只是收集当前输入这个指令某一段的内容，整体指令不在这里的
  const inputContent = ref("");

  // 肯定是遍历一个数组
  // 需要有：回车后自动滚动到容器底部，上下键切换已输入的指令，v-for生成输出列表
  // 设计思路：三种情况吧，info：打印出来的内容，static-input：已经执行了的命令，error：报错信息
  const shellItems = ref([ // 当前的shell中的数据展示的信息
    {
      id: getRandomString(),
      type: 'info',
      // 模板字符串需要处理一下才能带着换行展示到页面上
      // 但是之前我那俩，一个是alert里，一个是md编辑器里，好像都可以直接展示，应该是和输出环境是有关系的。
      value: `Hi there!🙂 Welcome to use this shell! Input commands below👇to use this! 
      If you don't know what commands you can use, please type [help] then type [Enter] to view the command list! 
      With NO MOUSE🖱️please!
      🛠Build with Vue3 & Vite. 
      `
    },
  ]);

  // 实现思路，监听键盘输入，判断输入进来的键，声明一个状态对象，存储当前状态（是不是type了空格什么的），如果是空格，那么触发一下什么，监听退格键什么的，或者用split一下空格看数组长度，判断当前输入。
  // 直接塞到一个数据对象(可能需要是个数组，因为还要涉及到上下箭头指令记录的问题)里，数据对象分好头，修饰符什么的，然后根据状态对象的状态来判定一下当前的输入，来动态的给上样式。可能需要输入好的数值动态的插入到input前面。动态改input里面的文字颜色即可

  // 那么，都有什么状态呢？
  
  // 固化的指令的容器ref
  let staticCommandContainer = ref(null);

  // 输入框的ref
  let commandInput = ref(null);

  const commands = [];
  // 当前命令内容采集器
  const commandCollectionNow = ref({
    commandHead: "", // 命令头
    commandHandleType: "", // 命令动作类型
    commandTarget: "", // 目标
    commandDecoration: "", // 修饰
    commandSymbol: "", //  指定等符号
    commandValue: "", // 指令整体字符串
  });

  //状态变迁记录数组
  const statesRecord = new ShellStatesRecord();

  // 同步修改状态改变副作用的函数
  function handleStateChangeByEffect(state, nextOrBack){
    // 状态改变需要同步的副作用
    // 清空当前命令内容采集器
    // 添加/删除相应的DOM元素
    // 添加/删除相关的状态record记录
    // 根据转到的状态，修改input相关样式(很简单吧应该，加上${}，css统一改类名即可)
  }

  // 特殊按键按下捕获
  function handleShellKeyUp(e){
    switch(e.key){
      default: {return}
      case " ":{// 空格
        // 需要做一下状态转移+绑定属性+清空+整体指令绑定
        if(statesRecord.stateNow === HEAD){ 
          if(inputContent.value.trim() === ""){// 就写空格，依然应该处于HEAD的状态，不理会
            return;
          }else{// 输入数据了
            // 先把数据弄进去，要是真是修饰就下面判定再改，默认下一状态就是动作类型
            // 同步修改状态改变的副作用
            statesRecord.pushState(HANDLETYPE);
          }
          break;
        }
        break;
      }
      case "ArrowUp":{// 上
        console.log('up');
        break;
      }
      case "ArrowDown":{// 下
        console.log('down');
        break;
      }
      case "Enter":{// 回车
        console.log('enter');
        break;
      }
      case "-":{// 杠 修饰符
        // 不允许在状态为HEAD的时候输入修饰
        console.log('-');
        break;
      }
      case "@":{// 指定@
        console.log('@');
        break;
      }
      case "#":{// #
        console.log('#');
        break;
      }
      case 'Delete':
      case "Backspace":{// 退格&删除  注意判定状态回退，以及状态回退时判定删除当前的指令中的内容
        console.log('de');
        break;
      }
    }
  }
  // 挂载时绑定键盘事件
  onMounted(()=>{
    window.addEventListener('keyup', handleShellKeyUp);
  });

  onUnmounted(()=>{// 解绑键盘事件
    window.removeEventListener('keyup', handleShellKeyUp);
  });

</script>

<template>
  <div class="shell-main-container">
    <div 
      class="shell-main-item" 
      v-for="item in shellItems"
      :key="item.id"
    >
      <div class="shell-main-left-arrow cmd-SYMBOL-part-text">></div>
      <span v-if="item.type === 'info'" v-html="formatString(item.value)"></span>
      <span 
        v-else-if="item.type === 'static-input'"  
        v-html="formatString(item.value)"
      ></span>
      <span 
        v-else-if="item.type === 'error'"
        v-html="formatString(item.value)"
        class="cmd-ERROR-part-text"
      >
      </span>
      <span v-else class="cmd-ERROR-part-text">Unknow Shell Item Type</span>
    </div>
    <!-- 总是存在一个输入框的，在最下面 -->
    <div class="shell-main-item">
      <div class="shell-main-left-arrow cmd-SYMBOL-part-text">></div>
      <span ref="staticCommandContainer"></span>
      <input 
        type="text" 
        ref="commandInput"
        class="shell-input cmd-HEAD-part-text" 
        v-model="inputContent"
        autofocus
      />
    </div>
  </div>
</template>

<style scoped>

  /* 整体终端框 */
  .shell-main-container{
    width: 100%;
    height: 100%;
    overflow: auto;
    /* 傻了吧唧的，margin也不会被borderBox算到宽高里啊，人算的是padding和border */
    padding: 1vw;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-content: flex-start;
  }

  /* 想改一下选中颜色来着，不顶用啊 */
  /* .shell-main-item span::selection, 
  .shell-main-item span::-moz-selection, 
  .shell-main-item span::-webkit-selection{
    background-color: rgba(62, 139, 254, 0.6);
  } */

  /* 命令头文字部分的样式 */
  .cmd-HEAD-part-text{
    color: var(--cmd-head-font-color);
  }

  /* 主体文字 */
  .cmd-TARGET-part-text, 
  .cmd-HANDLETYPE-part-text{
    color: var(--main-font-color);
  }

  /* 命令修饰文字部分的样式 */
  .cmd-DECORATION-part-text{
    color: var(--cmd-decoration-font-color);
  }

  /* 命令那几个符号文字后面的样式 */
  .cmd-SYMBOL-part-text{
    color: var(--cmd-symbol-font-color);
  }

  /* 错误出现时的颜色 */
  .cmd-ERROR-part-text{
    color: var(--cmd-error-font-color);
  }

  /* 每一项shell */
  .shell-main-item{
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 5px;
  }

  .shell-main-left-arrow{
    padding-top: 3px;
    margin-right: 1%;
    user-select: none;
  }

  .shell-input{
    border: none;
    outline: none;
    padding-top: 3px;
    width: 100%;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Cascadia Code SemiBold', 'Trebuchet MS', 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
    background-color: transparent;
  }
</style>
