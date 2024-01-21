import getRandomString from '../tools/getRandomString'

export const ERROR_NOTRECOGNIZE = {
  id: getRandomString(),
  type: 'error',
  value: `❌[ERROR: NOT_RECOGNIZE] I'm sorry, but the shell received an unrecognizable command😥.
  🔎Please check if there are any errors in the instructions.💥Especially the content after the command header.
  🟢You can seek help by typing the <strong>[help]</strong> command.`
}

export const ERROR_NOMATCH = {
  id: getRandomString(),
  type: 'error',
  value: `❌[ERROR: NO_MATCH] I'm sorry, but the shell can not find a command which can match the command you just typed in😥.
  🔎Please check if there are any errors in the instructions. 
  🟢You can seek help by typing the <strong>[help]</strong> command.`
}

export const EXEC_SUCCESSFULLY = {
  id: getRandomString(),
  type: 'success',
  value: `✔ [SUCCEESS] Command execution successful😉!`
}