import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages にデプロイする場合、リポジトリ名を base に設定する
// 例: https://<user>.github.io/lecture-notes/ → base: '/lecture-notes/'
// ユーザー/組織ルート (https://<user>.github.io/) で公開する場合は '/' のままに
const base = process.env.GITHUB_PAGES === 'true' ? '/lecture-notes/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
