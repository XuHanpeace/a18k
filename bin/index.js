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
  let fnName = pathObj.fnName

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
  console.log('--------------开始读取--------------\n')
  var arr = traverseDir(rootPath)
  pickup(arr, fnName)
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
    -t    指定翻译函数名
    -h    显示帮助 
  `)
}

/* 
 * 递归遍历目录
 * @param rootPath 待遍历文件夹的根路径
*/
function traverseDir(rootPath) {
	let files = fs.readdirSync(rootPath)
  let filesArr = []

 	files.forEach((filename) => {
 		let fullPath = path.join(rootPath, filename)
 		// console.log(fullPath) 	
 		let stats = fs.statSync(fullPath)
 		let isFile = stats.isFile()
 		let isDir = stats.isDirectory()

 		if(isFile) {
 			if(path.extname(fullPath) === '.js') {
        console.log(`正在读取 ${fullPath}`)
 				filesArr.push(fullPath)
 			}
 		}
 		if(isDir) {
 			filesArr = filesArr.concat(traverseDir(fullPath))
 		}
 	})
 	return filesArr
}

/* 
 * 提取未翻译的文案
 * @param arr
*/
function pickup(arr = [], fnName) {
  let text = [], _text = []
  arr.forEach((filePath) => {
    let _string = fs.readFileSync(filePath, {
      encoding: 'utf8'
    })
    // var reg = /translate\([\s\S]+?\)/g
    let reg = new RegExp(`${fnName}\\([\\'\\"][\\s\\S]+?[\\'\\"]\\)`, 'g')

    if (_string.match(reg)) {
      _text = _string
          .match(reg)
          .map((item, index) => {
            return item.replace(/[\s\S]+(\'|\")(.+?)(\'|\")[\s\S]+/, '$2')
          })
          .filter(key => {
            
            if (!locale[key] || locale[key] === '') {
              return key
            }
          })
      if(_text.length > 0) {
        text.push(..._text)
      }
    }
  })

  text = [...new Set(text)]
  if(text.length) {
    console.log(`\n--------------读取完成，一共发现${text.length}个未翻译项--------------`)
  }else {
    console.log(`\n--------------读取完成，未检测到未翻译项，可以放心转测了--------------`)
  }
  fs.writeFileSync('./send2pm.txt', text.join('\r'), err => {
    if (err) throw err
    console.log("It's saved!")
  })
}

/* 
 * 解析输入参数
 * @param arr 键入的参数
*/
function parseParam(arr) {
  let __localePath = './assets/i18n/vi.json',
      __rootPath = './views',
      __defaultFnName = 'translate',
      __indexOfJ = arr.indexOf('-j'), //参数-j的下标
      __indexOfP = arr.indexOf('-p'), //参数-p的下标
      __indexOfT = arr.indexOf('-t') //翻译函数名
  
  if(__indexOfJ > 0) { 
    __localePath = arr[__indexOfJ + 1]
  }
  if(__indexOfP > 0) {
    __rootPath = arr[__indexOfP + 1]
  }
  if(__indexOfT > 0) {
    __defaultFnName = arr[__indexOfT + 1]
  }

  return {
    localePath: __localePath,
    rootPath: __rootPath,
    fnName: __defaultFnName
  }
}
