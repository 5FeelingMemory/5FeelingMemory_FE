import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000, // 3000 포트로 설정
        // proxy: {
        //     '/http': {
        //         target: 'http://localhost:8080',
        //         changeOrigin: true,
        //         secure: false,
        //     },
        // },
    },
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
        svgr(),
        tsconfigPaths(),
    ],
});
