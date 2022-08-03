const path = require('path')
const glob = require('glob') // 文件匹配模式
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// 压缩css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')

// 路径处理方法
function resolve(dir){
  return path.join(__dirname, dir)
}

// 费时分析
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
// const smp = new SpeedMeasurePlugin()

const config = {
  mode: 'development',
  entry: {
    index:  './src/main.js'
  },
  output: {
    filename: 'bundle.js',
    path: resolve('dist')
  },
  devtool: process.env.NODE_ENV === 'dev' ? 'eval-cheap-module-source-map' : false,
  cache: {
    type: 'filesystem',
  },
  module: {
    noParse: /jquery|lodash/, // 不需要解析依赖的第三方大型类库等，可以通过这个字段进行配置，以提高构建速度
    rules: [
      {
        test:  /\.(s[ac]|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'cache-loader', // 获取前面 loader 转换的结果,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          // [ext] 自带 "." 这个与 url-loader 配置不同
          filename: "[name][hash:8][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 50 * 1024
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          filename: "[name][hash:8][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 超过100kb不转 base64
          }
        }
      },
      {
        test: /\.js$/i,
        include: resolve('src'),
        exclude: /node_modules/,
        use: [
          // {
          //   loader: 'thread-loader', // 开启多线程打包
          //   options: {
          //     worker: 3,
          //   }
          // },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true // 启用缓存
            }
          }
        ]
      }
      // {
      //   test: /\.(jpe?g|png|gif)$/i,
      //   use:[
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name][hash:8].[ext]'
      //       }
      //     }
      //   ]
      // },
      // {
      //   test: /\.(jpg|png|jpeg|gif)$/,
      //   // 处理图片资源
      //   // 默认处理不了html文件中的img图片
      //   loader: 'url-loader',
      //   options: {
      //     // 图片小于8kb，就被base64编码处理
      //     // 优点：减少请求数量（减轻服务器压力）
      //     // 缺点：图片体积会更大, 文件请求速度更慢
      //     limit: 8 * 1024,
      //     // 问题：因为url-loader默认使用es6模块化解析， 而html-loader引入图片的commonjs解析
      //     // 解析时会出现问题：[Object Module]
      //     // 解决：url-loader 的es6模块化，使用commonjs解析
      //     esModule: false
      //   },
      //   // ！！！！！！ 注意这个坑，webpack办的问题，就的assets loader 已经弃用，需要添加这个配置
      //   type: 'javascript/auto'
      // },
      // {
      //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,  // 匹配字体文件
      //   type: 'javascript/auto',
      //   loader: 'url-loader',
      //   options: {
      //     name: 'fonts/[name][hash:8].[ext]', // 体积大于 10KB 打包到 fonts 目录下 
      //     limit: 1 * 1024,
      //     esModule: false
      //   }
      // }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "My App",
      template: "./src/static/index.html"
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    }),
    // 清除无用的css
    new PurgecssPlugin({
      paths: glob.sync(`${resolve('src')}/**/*`, {nodir: true})
    }),
    // 只想保留数据不想启动 web 服务
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',  // 不启动展示打包报告的http服务器
      generateStatsFile: true, // 是否生成stats.json文件
    })
  ],
  optimization: {
    minimize: true, // 开启最小化
    minimizer: [
      // 添加 css 压缩配置
      new OptimizeCssAssetsPlugin({}),
      new TerserPlugin({})
    ],
    splitChunks: {
      chunks: 'async', // 有效值为 `all`，`async` 和 `initial`
      minSize: 20000, // 生成 chunk 的最小体积（≈ 20kb)
      minRemainingSize: 0, // 确保拆分后剩余的最小 chunk 体积超过限制来避免大小为零的模块
      minChunks: 1, // 拆分前必须共享模块的最小 chunks 数。
      maxAsyncRequests: 30, // 最大的按需(异步)加载次数
      maxInitialRequests: 30, // 打包后的入口文件加载时，还能同时加载js文件的数量（包括入口文件）
      enforceSizeThreshold: 50000,
      cacheGroups: { // 配置提取模块的方案
        defaultVendors: {
          test: /[\/]node_modules[\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    }
  },
  devServer: {
    contentBase: resolve('public'), // 静态文件目录
    compress: true, //是否启动压缩 gzip
    port: 8080, // 端口号
    open: true  // 是否自动打开浏览器
  },
  resolve:{
    modules: [resolve('src'), 'node_modules'],
    // 配置别名
    alias: {
      '~': resolve('src'),
      '@': resolve('src'),
      'components': resolve('src/components'),
    },
    extensions: ['.ts', '...']
  },
  resolveLoader: {
    modules: ['node_modules',resolve('loader')]
  },
  // 从输出的 bundle 中排除依赖
  externals: {
    jquery: 'jQuery'
  }
}

module.exports = (env, argv) => {
  return config
  // return smp.wrap(config)
}
