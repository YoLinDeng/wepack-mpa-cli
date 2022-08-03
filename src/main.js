
import './index.css'
import './sass.scss'
import logo from '../public/success-img.png'
// 引入字体图标文件
import './fonts/iconfont.css'

const a = 'Hello ITEM'
console.log(a)

const img = new Image()
img.src = logo

document.getElementById('imgBox').appendChild(img)


const fn = () => {
  console.log('fn')
}

fn()

// // 新增装饰器的使用
// @log('hi')
// class MyClass {
//  }

// function log(text) {
//   return function(target) {
//     target.prototype.logger = () => `${text}，${target.name}`
//   }
// }

// const test = new MyClass()
// console.log(test.logger())
