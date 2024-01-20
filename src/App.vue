<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import setTheme from './tools/setTheme'
  import getRandomString from './tools/getRandomString'
  import formatString from './tools/formatString'
  import { HEAD, HANDLETYPE, DECORATION, TARGET, SYMBOL, INIT } from "./consts/InputStates"
  import ShellStatesRecord from './tools/ShellStatesRecord'
  import checkAllSpaces from './tools/checkAllSpaces';
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

  let deleteChangeFlag = false; // 用于实现第二次减到0执行状态改变

  // 实现思路，监听键盘输入，判断输入进来的键，声明一个状态对象，存储当前状态（是不是type了空格什么的），如果是空格，那么触发一下什么，监听退格键什么的，或者用split一下空格看数组长度，判断当前输入。
  // 直接塞到一个数据对象(可能需要是个数组，因为还要涉及到上下箭头指令记录的问题)里，数据对象分好头，修饰符什么的，然后根据状态对象的状态来判定一下当前的输入，来动态的给上样式。可能需要输入好的数值动态的插入到input前面。动态改input里面的文字颜色即可

  // 那么，都有什么状态呢？
  
  // 当前命令内容采集器
  const commandCollectionNow = ref({
    id: getRandomString(),
    commandHEAD: "", // 命令头
    commandHANDLETYPE: "", // 命令动作类型
    commandTARGET: "", // 目标
    commandDECORATION: "", // 修饰
    commandSYMBOL: "", //  指定等符号
    commandValue: "", // 指令整体字符串，回车的时候再最后一起清算
    statesRecord: new ShellStatesRecord(), // 状态变迁记录数组
  });

  // 用来遍历生成input框的数组
  const collectionsInput = ref([
    {
      id: getRandomString(),
      className: HEAD,
      value: ""
    },
  ]);
  const inputElements = ref(null);


  //命令记录数组
  const commandCollections = []; // 回车的时候将commandCollectionNow加入到其中

  /**
   * 处理状态改变副作用的函数
   * @param {string} state 改变到的状态 
   * @param {boolean} isBack 是回退吗？需要回退的话请给上一个true，不需要不用给
   */
  function handleStateChangeByEffect(state, isBack = false){
    // 状态改变需要同步的副作用
    // 清空/设置当前命令内容采集器
    if(isBack){// 回退状态
      // 直接找到上一个呗
      const lastInput = collectionsInput.value.pop(); // 删掉上一个Input框
      commandCollectionNow.value[`command${lastInput.className}`] = ""; // 清掉相关内容
      commandCollectionNow.value.statesRecord.goBackState(); // 状态回退一下
      // 自动跳到焦点
      nextTick(()=>{
        inputElements.value[inputElements.value.length - 1]?.focus?.();
      });
    }else{
      // 生成新的采集器id，此id对应采集器数组中采集器项，state数组中state项和生成的static-input的DOM元素的id
      let collectionId = getRandomString(); 
      // 下面的内容应该是回车时触发的
      // // 命令采集器内容记录下来
      // commandCollections.push(commandCollectionNow.value);
      // // 清空命令内容采集器
      // for(let key in commandCollectionNow.value){
      //   commandCollectionNow.value[key] = "";
      // }
      // commandCollectionNow.value.id = collectionId;
      // 存入状态
      commandCollectionNow.value.statesRecord.pushState(state);
      // 绑定内容
      commandCollectionNow.value[`command${commandCollectionNow.value.statesRecord.getNowState()}`] =
       collectionsInput.value[collectionsInput.value.length -1].value;
      // 添加相应的input元素
      collectionsInput.value.push({
        id: collectionId,
        className: commandCollectionNow.value.statesRecord.getNowState(),
        value: ""
      });
      // 并自动将焦点放到那里
      // 由于 Vue 的渲染过程是异步的，新的输入元素可能还没有被渲染到 DOM 中
      // 使用 Vue 的 nextTick 方法来解决这个问题。nextTick 方法可以用来延迟一段代码的执行，直到 Vue 完成了当前的更新循环。这意味着，当 nextTick 中的代码被执行时，新的输入元素已经被渲染到了 DOM 中。
      nextTick(()=>{
        inputElements.value[inputElements.value.length - 1]?.focus?.();
      });
    }
    
    // 添加/删除相应的input元素

    // 添加/删除相关的状态record记录

    // 根据转到的状态，修改input相关样式(很简单吧应该，加上${}，css统一改类名即可)
  }

  // 特殊按键按下捕获
  function handleShellKeyUp(e){
    if(e.key !== 'Delete' && e.key !== 'Backspace'){
      deleteChangeFlag = false;// 处理回退逻辑
    }
    switch(e.key){
      default: {return}
      case " ":{// 空格
        // 需要做一下状态转移+绑定属性+清空+整体指令绑定
        nextTick(()=>{
          if(checkAllSpaces(collectionsInput.value[collectionsInput.value.length -1].value)){// 就写了个空格，依然应该处于HEAD的状态，不理会
            return;
          }else{// 输入数据了
            // 先把数据弄进去，要是真是修饰就下面判定再改，默认下一状态就是动作类型
            // 同步修改状态改变的副作用
            // 去掉之前input里的空格
            collectionsInput.value[collectionsInput.value.length -1].value = 
              collectionsInput.value[collectionsInput.value.length -1].value.trim();
            if(commandCollectionNow.value.commandHANDLETYPE === ""){
              handleStateChangeByEffect(HANDLETYPE);
            }else{
              handleStateChangeByEffect(TARGET);
            }
            return;
          }
        })
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
        // 不允许在状态为HEAD的时候输入-、#、@

        
        break;
      }
      case "-":{// 杠 修饰符
        if(collectionsInput.value[collectionsInput.value.length -1].value.trim().length !== 1){ // 不是在开头的
          return;
        }
        if(commandCollectionNow.value.statesRecord.getNowState() === HEAD){// HEAD的时候不要修饰符
          return;
        }
        if(commandCollectionNow.value.statesRecord.getLastState() === TARGET || 
          commandCollectionNow.value.statesRecord.getLastState() === HANDLETYPE
        ){
          // 先把状态弄过来
          commandCollectionNow.value.statesRecord.goBackState();
        }
        // 直接改状态改颜色，不要byEffect，不然就新建input了
        commandCollectionNow.value.statesRecord.pushState(DECORATION);
        collectionsInput.value[collectionsInput.value.length -1].className = DECORATION;
        break;
      }
      case "@":
      case "#":{// #，@
        if(collectionsInput.value[collectionsInput.value.length -1].value.trim().length !== 1){ // 不是在开头的
          return;
        }
        if(commandCollectionNow.value.statesRecord.getNowState() === HEAD){// HEAD的时候不要修饰符
          return;
        }
        if(commandCollectionNow.value.statesRecord.getLastState() === TARGET || 
          commandCollectionNow.value.statesRecord.getLastState() === HANDLETYPE
        ){
          // 先把状态弄过来
          commandCollectionNow.value.statesRecord.goBackState();
        }
        // 直接改状态改颜色
        commandCollectionNow.value.statesRecord.pushState(SYMBOL);
        collectionsInput.value[collectionsInput.value.length -1].className = SYMBOL;
        break;
      }
      case 'Delete':
      case "Backspace":{// 退格&删除  注意判定状态回退，以及状态回退时判定删除当前的指令中的内容
        console.log(commandCollectionNow.value);
        nextTick(()=>{
          if(collectionsInput.value[collectionsInput.value.length -1].value.length === 0 &&
            commandCollectionNow.value.statesRecord.getNowState() !== HEAD
          ){ // 第二次减到0再回退状态
            // 减到0了，再减的话，就该回退了
            if(deleteChangeFlag){
              // 触发状态回退
              handleStateChangeByEffect(commandCollectionNow.value.statesRecord.getLastState(), true);
              deleteChangeFlag = false;
            }else{
              // 下一次就该去掉了
              deleteChangeFlag = true;
            }
          } 
        });
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
    <div class="command-input-container" @click="()=>{inputElements[inputElements.length -1]?.focus?.()}">
      <span class="shell-main-left-arrow cmd-SYMBOL-part-text" style="padding: 0;">></span>
      <div class="command-input-main-container">
        <!-- 动态长度的input框 -->
        <input 
          v-for="item in collectionsInput"
          :key="item.id"
          type="text" 
          @click.stop=""
          ref="inputElements"
          :style="{
            width: item.value.length === 0 ? '20%' : 
            (
              item.value.trim().length * 0.65 + 
                (item.className === 'SYMBOL' ? 0.3 : 0)
            ) + 'vw'
          }"
          :class="`shell-input cmd-${item.className}-part-text`" 
          v-model="item.value"
        />
      </div>
    </div>
  </div>
</template>

<!-- scope的style会破坏JS动态添加class -->
<style>

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
    font-size: max(1.2vw, 1rem);
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

  .command-input-container{
    width: 100%;
  }

  .command-input-main-container{
    width: 80%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  /* 生成的静态命令项样式 */
  .static-input-span{
    user-select: none;
    line-height: 3vh;
  }

  .shell-main-left-arrow{
    float: left;
    padding-top: 3px;
    margin-right: 1%;
    user-select: none;
  }

  .shell-input{
    border: none;
    outline: none;
    margin-right: 0.2vw;
    font-weight: 500;
    /* 设置input光标颜色，和字体颜色不一致，和主字体颜色保持一致 */
    caret-color: var(--main-font-color);
    font-family: 'Cascadia Code SemiBold', 'Trebuchet MS', 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
    background-color: transparent;
    font-size: max(1.2vw, 1rem);
  }
</style>
