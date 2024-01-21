<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import setTheme from './tools/setTheme'
  import getRandomString from './tools/getRandomString'
  import formatString from './tools/formatString'
  import { HEAD, DECORATION, TARGET, SYMBOL, INIT } from "./consts/InputStates"
  import ShellStatesRecord from './tools/ShellStatesRecord'
  import checkAllSpaces from './tools/checkAllSpaces';
  import execCommand from './tools/execCommand'
  // 初始化自动配置主题
  onMounted(()=>{
    let localTheme = localStorage.getItem('theme')
    if(!localTheme){
      localTheme.setItem('theme', 'light')
      localTheme = 'light'
    }
    setTheme(localTheme);
  }); 

  // 整体shell容器
  const shellContainer = ref(null);

  // 肯定是遍历一个数组
  // 需要有：回车后自动滚动到容器底部，上下键切换已输入的指令，v-for生成输出列表
  // 设计思路：三种情况吧，info：打印出来的内容，static-input：已经执行了的命令，error：报错信息, success: 成功
  const shellItems = ref([ // 当前的shell中的数据展示的信息
    {
      id: getRandomString(),
      type: 'info',
      // 模板字符串需要处理一下才能带着换行展示到页面上
      // 但是之前我那俩，一个是alert里，一个是md编辑器里，好像都可以直接展示，应该是和输出环境是有关系的。
      value: `🙂Hi there! Welcome to use this shell-like! Input commands below👇to use this! 
      🔎If you don't know what commands you can use, please type [<strong>help</strong>] then type [Enter] to view the command list! 
      🛠 Build with Vue3 & Vite. 
      🚩Version<span class="cmd-SYMBOL-part-text">@1.0.0 beta</span>.
      🖍 Written by PiaoChen, all rights reserved. (Still updating at random time😘).
      🔗Code of this shell repository address: <a href="https://gitee.com/piao-chen/shell-demo" class="cmd-SYMBOL-part-text" target="_blank">Click me!</a>
      `
    },
  ]);

  let deleteChangeFlag = false; // 用于实现第二次减到0执行状态改变
  
  // 当前命令内容采集器
  const commandCollectionNow = ref({
    id: getRandomString(),
    commandHEAD: "", // 命令头
    commandTARGET: [], // 目标
    commandDECORATION: [], // 修饰
    commandSYMBOL: [], //  指定等符号
    commandValue: "", // 指令整体字符串，回车的时候再最后一起清算
    statesRecord: new ShellStatesRecord(), // 状态变迁记录数组
  });

  // 用来遍历生成input框的数组
  const collectionsInput = ref([
    {
      id: getRandomString(),
      className: HEAD,
      needInit: true,
      value: ""
    },
  ]);
  const inputElements = ref(null); // 所有input元素element数组
  const nowInputIndex = ref(0); // 用来看当前焦点所在的是哪一个input

  const whiteProps = ref([TARGET, DECORATION, SYMBOL]); // 收集使用数组的属性
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
      commandCollectionNow.value.statesRecord.goBackState(); // 状态回退一下
      // 自动跳到焦点，触发焦点事件自动更新nowInputIndex
      nextTick(()=>{
        inputElements.value[nowInputIndex.value - 1]?.focus?.();
      });
    }else{
      // 生成新的采集器id，此id对应采集器数组中采集器项，state数组中state项和生成的static-input的DOM元素的id
      let collectionId = getRandomString(); 
      // 存入状态
      commandCollectionNow.value.statesRecord.pushState(state);
      // 绑定内容在onchange中完成了
      // 添加相应的input元素
      collectionsInput.value.push({
        id: collectionId,
        className: commandCollectionNow.value.statesRecord.getNowState(),
        needInit: true,
        value: ""
      });
      // 并自动将焦点放到那里
      // 由于 Vue 的渲染过程是异步的，新的输入元素可能还没有被渲染到 DOM 中
      // 使用 Vue 的 nextTick 方法来解决这个问题。nextTick 方法可以用来延迟一段代码的执行，直到 Vue 完成了当前的更新循环。这意味着，当 nextTick 中的代码被执行时，新的输入元素已经被渲染到了 DOM 中。
      nextTick(()=>{
        inputElements.value[nowInputIndex.value + 1]?.focus?.();
      });
    }
  }

  // 特殊按键按下捕获
  function handleShellKeyUp(e){
    if(e.key !== 'Delete' && e.key !== 'Backspace'){
      deleteChangeFlag = false;// 处理回退逻辑
      collectionsInput.value[nowInputIndex.value].needInit = false; // 防止跳变
    }
    switch(e.key){
      default: {return}
      case " ":{// 空格
        // 需要做一下状态转移+绑定属性+清空+整体指令绑定
        nextTick(()=>{
          if(checkAllSpaces(collectionsInput.value[nowInputIndex.value].value)){// 就写了个空格，依然应该处于HEAD的状态，不理会
            return;
          }else{// 输入数据了
            // 先把数据弄进去，要是真是修饰就下面判定再改，默认下一状态就是动作类型
            // 同步修改状态改变的副作用
            // 去掉之前input里的两边空格
            collectionsInput.value[nowInputIndex.value].value = 
              collectionsInput.value[nowInputIndex.value].value.trim();
            // 如果是在input内的内容中间敲空格，应该是将空格后的内容送到下一个input里，插入生成一个input，后面的input不需要改状态
            let value = inputElements.value[nowInputIndex.value].value;
            value = value.split(' ');
            if(value[1] !== ''){ // 不是在最后的空格
              // 执行插入
              collectionsInput.value.splice(nowInputIndex.value + 1, 0, {
                id: getRandomString(),
                className: TARGET,
                value: value[1]
              });
              // 手动改的没更新上，不要用inputElements，用collectionsInput
              collectionsInput.value[nowInputIndex.value].value = value[0]; 
            }
            // 如果是最后一个，那空格会生成一个input
            if(nowInputIndex.value === collectionsInput.value.length - 1){
              handleStateChangeByEffect(TARGET);
            }else{// 不是最后一个，直接获取下一个的焦点即可
              inputElements.value[nowInputIndex.value + 1]?.focus?.();
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
        // 该汇总的汇总，该入库的入库，该新建的新建，该重新初始化的重新初始化
        if(commandCollectionNow.value.statesRecord.getNowState() === HEAD && 
            checkAllSpaces(collectionsInput.value[nowInputIndex.value].value)
        ){ // 什么也没输呢
          return;
        }
        // 汇总属性
        commandCollectionNow.value.commandValue = ""; // 就先空串，防止编辑的时候出问题
        for(let item of collectionsInput.value){
          commandCollectionNow.value.commandValue += item.value + " ";
        }
        commandCollections.push(commandCollectionNow.value); // 存入命令数组中
        let commandLast = commandCollectionNow.value.commandValue.split(' ');
        let staticInputStr = ``;
        let needHead = true;
        // 分割命令，存入数据
        commandLast.forEach(item=>{
          if(needHead){
            staticInputStr += `<span class='cmd-HEAD-part-text'>${item} </span>`;
            commandCollectionNow.value.commandHEAD = item;
            needHead = false;
          }else if(item.charAt(0) === '-'){
            staticInputStr += `<span class='cmd-DECORATION-part-text'>${item} </span>`;
            commandCollectionNow.value.commandDECORATION.push(item);
          }else if(item.charAt(0) === '@' || item.charAt(0) === '#'){
            staticInputStr += `<span class='cmd-SYMBOL-part-text'>${item} </span>`;
            commandCollectionNow.value.commandSYMBOL.push(item);
          }else if(item !== ''){
            staticInputStr += `<span class='cmd-TARGET-part-text'>${item} </span>`;
            commandCollectionNow.value.commandTARGET.push(item);
          }
        });
        // 将内容固化生成span
        shellItems.value.push({
          id: getRandomString(),
          type: 'static-input',
          value: staticInputStr,
        });

        // 执行命令并输出结果，注意可传一个extra对象的
        const commandExecRes = execCommand(commandCollectionNow.value);
        shellItems.value.push(commandExecRes);

        // 重新初始化
        commandCollectionNow.value = {
          id: getRandomString(),
          commandHEAD: "", // 命令头
          commandTARGET: [], // 目标
          commandDECORATION: [], // 修饰
          commandSYMBOL: [], //  指定等符号
          commandValue: "", // 指令整体字符串，回车的时候再最后一起清算
          statesRecord: new ShellStatesRecord(), // 状态变迁记录数组
        };

        collectionsInput.value = [
          {
            id: getRandomString(),
            className: HEAD,
            needInit: true,
            value: ""
          },
        ];

        inputElements.value = null;
        nowInputIndex.value = 0;
        
        // 容器自动滚动到最底部
        if(shellContainer.value){
          shellContainer.value.scrollIntoView?.({
            block: 'end',
            behavior: 'smooth'
          });
        }

        nextTick(()=>{
          // 自动获取焦点
          inputElements.value[nowInputIndex.value]?.focus?.();
        });

        break;
      }
      case "-":{// 杠 修饰符
        if(collectionsInput.value[nowInputIndex.value].value.trim().length !== 1){ // 不是在开头的
          return;
        }
        if(commandCollectionNow.value.statesRecord.getNowState() === HEAD){// HEAD的时候不要触发修饰符
          return;
        }
        if(commandCollectionNow.value.statesRecord.getNowState() === TARGET){
          // 先把状态弄过来
          commandCollectionNow.value.statesRecord.goBackState();
        }
        // 直接改状态改颜色，不要byEffect，不然就新建input了
        commandCollectionNow.value.statesRecord.pushState(DECORATION);
        collectionsInput.value[nowInputIndex.value].className = DECORATION;
        break;
      }
      case "@":
      case "#":{// #，@
        if(collectionsInput.value[nowInputIndex.value].value.trim().length !== 1){ // 不是在开头的
          return;
        }
        if(commandCollectionNow.value.statesRecord.getNowState() === HEAD){// HEAD的时候不要修饰符
          return;
        }
        if(commandCollectionNow.value.statesRecord.getNowState() === TARGET){
          // 先把状态弄过来
          commandCollectionNow.value.statesRecord.goBackState();
        }
        // 直接改状态改颜色
        commandCollectionNow.value.statesRecord.pushState(SYMBOL);
        collectionsInput.value[nowInputIndex.value].className = SYMBOL;
        break;
      }
      case 'Delete':
      case "Backspace":{// 退格&删除  注意判定状态回退，以及状态回退时判定删除当前的指令中的内容
        nextTick(()=>{
          if(collectionsInput.value[nowInputIndex.value].value.length === 0 &&
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

  // 命令输入框自动获取焦点
  onMounted(()=>{
    inputElements.value[inputElements.value.length - 1]?.focus?.();
  });
  // 挂载时绑定键盘事件
  onMounted(()=>{
    window.addEventListener('keyup', handleShellKeyUp);
  });

  onUnmounted(()=>{// 解绑键盘事件
    window.removeEventListener('keyup', handleShellKeyUp);
  });

  function clearWindow(){
    
  }

</script>

<template>
  <div class="shell-main-container" ref="shellContainer">
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
        v-else-if="item.type === 'success'"  
        class="cmd-SYMBOL-part-text"
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
      <span class="shell-main-left-arrow cmd-SYMBOL-part-text">></span>
      <div class="command-input-main-container">
        <input 
          v-for="(item, index) in collectionsInput"
          :key="item.id"
          type="text" 
          @click.stop=""
          ref="inputElements"
          spellcheck="false"
          :style="{
            width: item.value?.length === 0 && item.needInit ? '20%' : 
            (
              item.value.trim?.().length * 0.68 + 
                (item.className === 'SYMBOL' ? 0.3 : 0) +
                  (item.value?.trim?.().length === 0 && item.needInit ? 5 :0)
            ) + 'vw'
          }"
          :class="`shell-input cmd-${item.className}-part-text`" 
          @focus="()=>{nowInputIndex = index}"
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
  .cmd-TARGET-part-text{
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
    user-select: none;
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
