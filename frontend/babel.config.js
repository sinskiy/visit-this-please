export default {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [
    process.env.DEVELOPMENT && "react-refresh/babel",
    "babel-plugin-styled-components",
    "babel-plugin-tsconfig-paths",
  ].filter(Boolean),
};
