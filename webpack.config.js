const path = require("path");

module.exports = {
  entry: {
    main: './src/app.js',
    rain: './src/rain.page.js',
    sun: './src/sun.page.js',
    lightning: './src/lightning.page.js'
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
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000
    //contentBase: path.join(__dirname, "public")
  }
}