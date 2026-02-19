import vituum from "vituum";
import posthtml from "@vituum/vite-plugin-posthtml";

export default {
    plugins: [
        vituum(),
        posthtml({
            root: "./src",
        }),
    ],
    server: {
        port: 5000,
        host: true,
        allowedHosts: ["dev.markidiags.com", "localhost"],
    },
};
