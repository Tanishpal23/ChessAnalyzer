import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const targetDir = path.join(projectRoot, 'public', 'stockfish')
const sourceDir = path.join(projectRoot, 'node_modules', 'stockfish', 'bin')

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir)
  for (const file of files) {
    // Only copy the lite single-threaded browser build (7.2MB)
    if (file.includes('lite-single')) {
      const srcPath = path.join(sourceDir, file)
      const destPath = path.join(targetDir, file)
      fs.copyFileSync(srcPath, destPath)
    }
  }
  console.log('Stockfish lite engine files successfully copied to public/stockfish')
} else {
  console.warn('Stockfish bin directory not found in node_modules/stockfish/bin')
}
