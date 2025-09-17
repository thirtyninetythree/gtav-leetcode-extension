import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

export default defineConfig({
    build: {
        outDir: 'dist',
        minify: false,
        lib: {
            name: 'GTAV LeetCode',
            entry: {
                background: resolve(__dirname, 'src/background.ts'),
                content: resolve(__dirname, 'src/content.ts')
            },
            formats: ['cjs'],
            fileName: (format, entryName) => `${entryName}.js`
        },
        rollupOptions: {
            output: {
                entryFileNames: '[name].js'
            }
        }
    },
    plugins: [
        {
            name: 'copy-assets',
            async closeBundle() {
                // Copy manifest.json
                await fs.copyFile(
                    resolve(__dirname, 'public/manifest.json'),
                    resolve(__dirname, 'dist/manifest.json')
                )

                // Copy popup.html
                await fs.copyFile(
                    resolve(__dirname, 'public/popup.html'),
                    resolve(__dirname, 'dist/popup.html')
                )

                // Copy assets
                await copyDir('public/assets', 'dist/assets')
                await copyDir('public/banners', 'dist/banners')
                await copyDir('public/sounds', 'dist/sounds')
            }
        }
    ]
})

async function copyDir(src: string, dest: string) {
    await fs.mkdir(dest, { recursive: true })
    const entries = await fs.readdir(src, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = resolve(src, entry.name)
        const destPath = resolve(dest, entry.name)

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath)
        } else {
            await fs.copyFile(srcPath, destPath)
        }
    }
}
