import commandListObj from "../consts/CommandList";
import { ERROR_NOMATCH } from "../consts/ConstResults";

/**
 * 实现执行指令，返回指令的执行结果对象
 * @param {{id: string | undefined;commandHEAD: string;commandTARGET: never[];commandDECORATION: never[];commandSYMBOL: never[];commandValue: string;statesRecord: {records: string[];getNowState: () => string;getLastState: () => string;pushState: (state: string) => void;goBackState: () => void;};}} commandObject 指令对象 
 * @param {object} extraProps 额外的可能用到的参数
 * @returns {{id: string | undefined;type: 'info' | 'static-input' | 'error' | 'success';value: string;}} 指令的执行结果对象
 */
export default function execCommand(commandObject, extraProps){
  // console.log(commandObject);
  const res = commandListObj.commandList.find(item => 
    item.HEAD ===  commandObject.commandHEAD.toLocaleLowerCase()
  );
  if(res){
    return res.HandlerFunc(commandObject, res, extraProps);
  }else{
    return ERROR_NOMATCH;
  }
}