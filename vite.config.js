import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 👇 关键配置，和你的仓库名保持一致
  base: '/me/',
})
