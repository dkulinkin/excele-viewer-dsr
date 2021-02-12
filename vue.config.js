module.export = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/]
      },
      {
        test: /\.worker\.ts$/,
        use: { loader: "worker-loader" }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};