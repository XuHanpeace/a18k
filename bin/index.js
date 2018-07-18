#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

let textArr = [] //存放读取出来的文案

let localePath = '' //语言包路径
let rootPath = '' //待检测文件的根路径
let localeString = '' //语言包字符串
let locale = {} //语言包JSON

let argv = process.argv.slice(2)

if(argv.length === 0) {
  console.log('a18k, born to find those untranslated WenAn out for you, PEACE!')
  return
}

if(argv[0] === '-h') {
  showHelp()
  return
}

if(argv[0] === 'check') {
  let pathObj = parseParam(argv)
  let localePath = pathObj.localePath
  let rootPath = pathObj.rootPath

  try{
    localeString = fs.readFileSync(localePath)
  }catch(e) {
    console.error(`${localePath} \n 该文件不存在，请重新指定语言包路径`)
    showHelp()
    return 
  }
  
  try {
    locale = JSON.parse(localeString)
  } catch (e) {
    console.error('语言包格式非法，请使用json格式')
    showHelp()
    return 
  }
  traverseDir(rootPath)
  return
}else {
  console.log(`Unknown parameter: ${argv[0]}. `)
  showHelp()
  return
}

function showHelp() {
  console.log(`
  可选参数：
    -j    指定语言包的相对路径。默认为当前路径下'./assets/i18n/vi.json'
    -p    指定待检查的文件夹的相对路径。默认为当前路径下的'./views'
    -h    显示帮助 
  `)
}

/* 
 * 解析输入参数
 * @param arr 键入的参数
*/
function parseParam(arr) {
  let __localePath = './assets/i18n/vi.json',
      __rootPath = './views',
      __indexOfJ = arr.indexOf('-j'), //参数-j的下标
      __indexOfP = arr.indexOf('-p') //参数-p的下标
  
  if(__indexOfJ > 0) { 
    __localePath = arr[__indexOfJ + 1]
  }
  if(__indexOfP > 0) {
    __rootPath = arr[__indexOfP + 1]
  }

  return {
    localePath: __localePath,
    rootPath: __rootPath
  }
}

/* 
 * 文件遍历
 * @param rootPath 需要遍历的文件夹路径
*/
function traverseDir(rootPath) {
  fs.readdir(rootPath, (err, files) => {
    if (err) {
      console.warn(err)
    } else {
      //files为读取到的文件名列表
      files.forEach(fileName => {
        //拼接文件绝对路径
        var filePath = path.join(rootPath, fileName)
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.warn(err)
          } else {
            var isFile = stats.isFile(), //判断是否是文件
              isDir = stats.isDirectory() //判断是否是文件夹
            if (isFile) {
              if (path.extname(filePath) === '.js') {
                console.log(`正在读取${filePath}`)
                extract(filePath)
              }
            }
            if (isDir) {
              traverseDir(filePath)
            }
          }
        })
      })
    }
  })
}

/* 
 * 提取文翻译文案
 * @param filepath 需要检测的.js文件
*/
function extract(filepath) {
  var string = fs.readFileSync(filepath, {
    encoding: 'utf8'
  })
  var reg = /translate\([\s\S]+?\)/g

  if (string.match(reg)) {
    var arr = string
      .match(reg)
      .map((item, index) => {
        return item.replace(/[\s\S]+(\'|\")(.+?)(\'|\")[\s\S]+/, '$2')
      })
      .filter(key => {
        if (!locale[key] || locale[key] === '') {
          return key
        }
      })
  }
  // console.log(textArr)
  textArr = [...new Set(textArr.concat(arr))]
  fs.writeFileSync('./send2pm.txt', textArr.join('\r'), err => {
    if (err) throw err
    console.log("It's saved!")
  })
}

