import vituum from 'vituum'
import posthtml from '@vituum/vite-plugin-posthtml'
import tailwindcss from '@vituum/vite-plugin-tailwindcss'


export default {
    plugins: [vituum(),tailwindcss(), posthtml({
        root: './src'
    })],
    server: {
        port: 5000
    }
}
