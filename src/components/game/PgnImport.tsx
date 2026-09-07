import { useState } from 'react'
import { useChessStore } from '@/store/chessStore'
import styles from './PgnImport.module.css'

interface Props {
  onClose: () => void
}

export function PgnImport({ onClose }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const loadPgn = useChessStore((s) => s.loadPgn)

  const handleImport = () => {
    if (!text.trim()) {
      setError('Please paste a PGN.')
      return
    }
    const result = loadPgn(text.trim())
    if (!result.success) {
      setError(result.error ?? 'Invalid PGN')
    } else {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Import PGN">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Import PGN</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => { setText(e.target.value); setError(null) }}
          placeholder="Paste PGN here…"
          rows={10}
          spellCheck={false}
          autoFocus
        />

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.importBtn} onClick={handleImport}>Import</button>
        </div>
      </div>
    </div>
  )
}
