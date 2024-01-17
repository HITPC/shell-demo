/**
 * 用于切换主题
 * @param {'light' | 'dark'} theme 要切换到的主题
 */
export default function setTheme(theme){
  if(theme === 'dark'){ 
    // 切换到dark
    document.documentElement.style.setProperty('--main-background-color', 'rgb(39, 39, 39)');
    document.documentElement.style.setProperty('--main-font-color', 'rgb(192, 192, 192)');
    document.documentElement.style.setProperty('--cmd-decoration-font-color', 'rgba(192, 192, 192, .5)');
    document.documentElement.style.setProperty('--cmd-main-font-color', 'rgb(250, 250, 0)');
  }else{
    // 切换到light
    document.documentElement.style.setProperty('--main-background-color', '#fff');
    document.documentElement.style.setProperty('--main-font-color', 'rgb(70, 70, 70)');
    document.documentElement.style.setProperty('--cmd-decoration-font-color', 'rgba(39, 39, 39, .5)');
    document.documentElement.style.setProperty('--cmd-main-font-color', 'rgb(179, 0, 250)');
  }
}