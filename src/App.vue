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
      If you don't know what commands you can use, please type help then Enter to view the command list! 
      Build with Vue3 & Vite. 
      `
    },
    // 但是这里的问题有点大，好像一个Input是行不通的，可能需要多个，然后通过空格来什么切一下
    {
      id: getRandomString(),
      type: 'input',
      value: ""
    },
  ]);

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
        class="shell-input" 
        autofocus
      />
      <span v-else class="cmd-error-part-text">Unknow Shell Type</span>
    </div>
  </div>
</template>

<style scoped>

</style>
