export default {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [process.env.DEVELOPMENT && "react-refresh/babel"].filter(Boolean),
};
