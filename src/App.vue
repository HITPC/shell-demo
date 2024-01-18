<script setup>
  import { ref, onMounted } from 'vue';
  import setTheme from './tools/setTheme'
  import getRandomString from './tools/getRandomString'
  import formatString from './tools/formatString'
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

  // 肯定是遍历一个数组
  // 需要有：回车后自动滚动到容器底部，上下键切换已输入的指令，v-for生成输出列表
  // 设计思路：三种情况吧，info：打印出来的内容，input：输入框，static-input：已经执行了的命令
  const shellItems = ref([
    {
      id: getRandomString(),
      type: 'info',
      // 模板字符串需要处理一下才能带着换行展示到页面上
      // 但是之前我那俩，一个是alert里，一个是md编辑器里，好像都可以直接展示，应该是和输出环境是有关系的。
      value: `Hi there!🙂 Welcome to use this shell! Input commands below👇 to use this! 
      If you don't know what commands you can use, please type [help] then type [Enter] to view the command list! 
      🛠Build with Vue3 & Vite. 
      `
    },
    // 但是这里的问题有点大，好像一个Input是行不通的，可能需要多个，然后通过空格来什么切一下
    {
      id: getRandomString(),
      type: 'input',
      value: ""
    },
  ]);

  // 实现思路，监听键盘输入，判断输入进来的键，声明一个状态对象，存储当前状态（是不是type了空格什么的），如果是空格，那么触发一下什么，监听退格键什么的，或者用split一下空格看数组长度，判断当前输入。
  // 直接塞到一个数据对象(可能需要是个数组，因为还要涉及到上下箭头指令记录的问题)里，数据对象分好头，修饰符什么的，然后根据状态对象的状态来判定一下当前的输入，来动态的给上样式。可能需要输入好的数值动态的插入到input前面。动态改input里面的文字颜色即可

  // 那么，都有什么状态呢？


</script>

<template>
  <div class="shell-main-container">
    <div 
      class="shell-main-item" 
      v-for="item in shellItems"
      :key="item.id"
    >
      <div class="shell-main-left-arrow cmd-symbol-part-text">></div>
      <span v-if="item.type === 'info'" v-html="formatString(item.value)"></span>
      <span v-else-if="item.type === 'static-input'"></span>

      <input 
        v-else-if="item.type === 'input'" 
        type="text" 
        class="shell-input cmd-main-part-text" 
        autofocus
      />
      <span v-else class="cmd-error-part-text">Unknow Shell Type</span>
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
  .cmd-head-part-text{
    color: var(--cmd-head-font-color);
  }

  .cmd-main-part-text{
    color: var(--main-font-color);
  }

  /* 命令修饰文字部分的样式 */
  .cmd-decoration-part-text{
    color: var(--cmd-decoration-font-color);
  }

  /* 命令那几个符号文字后面的样式 */
  .cmd-symbol-part-text{
    color: var(--cmd-symbol-font-color);
  }

  /* 错误出现时的颜色 */
  .cmd-error-part-text{
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
