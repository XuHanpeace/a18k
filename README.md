# a18k
你只要给我一个语言包，我就能帮你找到指定文件夹下未翻译的文案

## 安装
```bash
> npm install -g a18k
```
安装后输入入``a18k``检测是否成功

```bash
> a18k
a18k, born to find those untranslated WenAn out for you, PEACE!
```

输入``a18k -h``获取帮助
```bash
> a18k -h 

可选参数：
    -j    指定语言包的相对路径。默认为当前路径下'./assets/i18n/vi.json'
    -p    指定待检查的文件夹的相对路径。默认为当前路径下的'./views'
    -h    显示帮助
```

## 使用

```bash
> a18k check -j 语言包相对路径 -p 待检查的文件夹的相对路径
```
工具会自动生成``send2pm.txt``文件，未翻译的文案将在这里呈现。如文件名，你应该直接把文件内容发给产品经理，叫他们重新提供翻译

## 推荐用法
直接cd到项目根目录，命令行输入
```bash
> a18k check
```
工具将会直接读取``./assets/i18n/vi.json``文件，检测``./views``文件夹下所有的文案

所以，你的目录结构最好像下面这个样子，否则你只能手动设置语言包的路径了
```bash
|-- root @
|   |-- assets
|   |   |-- i18n
|   |   |   |-- vi.json
|   |-- views
|       |-- index.js
|       |-- style.scss
```

