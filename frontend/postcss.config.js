import theme from "postcss-material-colors";

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [theme({ darkModeStrategy: "media" })],
};

export default config;
