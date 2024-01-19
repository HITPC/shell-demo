import { HEAD, HANDLETYPE, DECORATION, TARGET, SYMBOL, INIT } from "../consts/InputStates"

class ShellStatesRecords{
  constructor(){
    this.records = [INIT, HEAD];
    this.stateNow = this.getStateNow();
    this.stateLast = this.getStateLast();
  }

  getStateNow(){
    return this.records[this.records.length - 1];
  }

  getStateLast(){
    if(this.records.length < 2){
      throw new Error('错误的records长度');
    }
    return this.records[this.records.length - 2];
  }

  /**
   * 状态加入
   * @param {string} state 要加入的状态
   */
  pushState(state){
    const whiteStates = [HEAD, TARGET, DECORATION, HANDLETYPE, SYMBOL];
    if(whiteStates.includes(state)){
      this.records.push(state);
    }else{
      throw new Error(`错误的state类型-${state}, 不允许加入records`);
    }
  }

  /**
   * 状态回退
   */
  goBackState(){
    if(this.records.length === 2){
      throw new Error('状态记录仅剩余2个, 不允许再进行回退')
    }
    this.records.pop();
  }
}

export default ShellStatesRecords;