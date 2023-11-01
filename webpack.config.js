const path = require("path");

module.exports = {
  entry: {
    main: './public/MetaphorVis/src/app.js',
    rain: './public/MetaphorVis/src/rain.page.js',
    sun: './public/MetaphorVis/src/sun.page.js',
    lightning: './public/MetaphorVis/src/lightning.page.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    library: ['Metaphor'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000
    //contentBase: path.join(__dirname, "public")
  }
}