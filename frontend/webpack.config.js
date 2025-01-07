import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import Dotenv from "dotenv-webpack";
import path from "node:path";
import "webpack-dev-server";

/**
 * @type {import('webpack').Configuration}
 */
export default {
  mode: process.env.DEVELOPMENT ? "development" : "production",
  devtool: process.env.DEVELOPMENT ? "inline-source-map" : false,
  devServer: {
    static: "./dist",
    watchFiles: "./src/index.html",
    hot: true,
    historyApiFallback: true,
  },
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(import.meta.dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  plugins: [
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
      chunkFilename: "[id].[contenthash:8].css",
    }),
    process.env.DEVELOPMENT && new ForkTsCheckerPlugin(),
    process.env.DEVELOPMENT && new ReactRefreshWebpackPlugin(),
    new CopyPlugin({ patterns: [{ from: "./public", to: "." }] }),
    new Dotenv(),
  ].filter(Boolean),
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};
