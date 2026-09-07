import { useState } from 'react'
import { useChessStore } from '@/store/chessStore'
import styles from './FenDisplay.module.css'

export function FenDisplay() {
  const currentFen = useChessStore((s) => s.currentFen)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFen)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback: select the input text
    }
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>FEN</span>
      <input
        className={styles.fenInput}
        value={currentFen}
        readOnly
        onClick={(e) => (e.target as HTMLInputElement).select()}
        aria-label="Current position FEN"
        spellCheck={false}
      />
      <button
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label="Copy FEN to clipboard"
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}
