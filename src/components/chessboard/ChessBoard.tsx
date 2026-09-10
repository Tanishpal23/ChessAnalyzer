import { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types'
import { useChessGame } from '@/hooks/useChessGame'
import { useChessStore } from '@/store/chessStore'
import { useEngineStore } from '@/store/engineStore'
import styles from './ChessBoard.module.css'

export function ChessBoard() {
  const { currentFen, boardFlipped, makeMove, gameStatus } = useChessGame()
  const getLegalMoves = useChessStore((s) => s.getLegalMoves)
  const gameMode = useChessStore((s) => s.gameMode)
  const turn = useChessStore((s) => s.turn)
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex)
  const moveHistory = useChessStore((s) => s.moveHistory)
  const analysis = useEngineStore((s) => s.analysis)

  const containerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState<number>(520)

  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (containerRef.current) {
        const w = Math.floor(containerRef.current.clientWidth)
        if (w > 0) setBoardWidth(w)
      }
    }

    updateWidth()

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.floor(entry.contentRect.width)
          if (w > 0) setBoardWidth(w)
        }
      })
      ro.observe(containerRef.current)
    }

    window.addEventListener('resize', updateWidth)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [showBestMoveArrow] = useState(true)

  const isGameOver = gameStatus !== 'playing'
  const isReviewing = currentMoveIndex < moveHistory.length - 1
  const playerColor = boardFlipped ? 'b' : 'w'
  const isEngineTurn = gameMode === 'vs-engine' && turn !== playerColor && !isReviewing

  // Best move arrow from engine (hidden in vs-engine mode)
  const bestMoveArrows = useMemo(() => {
    if (gameMode === 'vs-engine') {
      return []
    }
    if (!showBestMoveArrow || !analysis.bestMoveUci || analysis.bestMoveUci.length < 4) {
      return []
    }
    const from = analysis.bestMoveUci.slice(0, 2) as Square
    const to = analysis.bestMoveUci.slice(2, 4) as Square
    return [[from, to, '#5b8dd9']] as [Square, Square, string][]
  }, [gameMode, showBestMoveArrow, analysis.bestMoveUci])

  const onSquareClick = useCallback(
    (square: string) => {
      if (isGameOver || isEngineTurn) return

      if (selectedSquare) {
        // If clicked square is one of legal moves, make move
        if (legalMoves.includes(square)) {
          // Check if promotion
          const isWhitePromotion = selectedSquare[1] === '7' && square[1] === '8'
          const isBlackPromotion = selectedSquare[1] === '2' && square[1] === '1'
          const isPawnPromotion = isWhitePromotion || isBlackPromotion

          makeMove(selectedSquare, square, isPawnPromotion ? 'q' : undefined)
          setSelectedSquare(null)
          setLegalMoves([])
          return
        }

        // Otherwise check if selecting a new piece
        const moves = getLegalMoves(square)
        if (moves.length > 0) {
          setSelectedSquare(square)
          setLegalMoves(moves)
        } else {
          setSelectedSquare(null)
          setLegalMoves([])
        }
      } else {
        const moves = getLegalMoves(square)
        if (moves.length > 0) {
          setSelectedSquare(square)
          setLegalMoves(moves)
        }
      }
    },
    [selectedSquare, legalMoves, getLegalMoves, makeMove, isGameOver, isEngineTurn]
  )

  const onPieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
      if (isGameOver || isEngineTurn) return false

      const isPromotion =
        piece[1] === 'P' &&
        ((targetSquare[1] === '8' && piece[0] === 'w') ||
          (targetSquare[1] === '1' && piece[0] === 'b'))

      const success = makeMove(
        sourceSquare,
        targetSquare,
        isPromotion ? 'q' : undefined
      )

      setSelectedSquare(null)
      setLegalMoves([])
      return success
    },
    [makeMove, isGameOver, isEngineTurn]
  )

  // Custom square styles for selection and legal moves
  const customSquareStyles = useMemo(() => {
    const stylesMap: Record<string, object> = {}

    if (selectedSquare) {
      stylesMap[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      }
    }

    for (const sq of legalMoves) {
      stylesMap[sq] = {
        background:
          'radial-gradient(circle, rgba(0, 0, 0, 0.25) 24%, transparent 25%)',
        borderRadius: '50%',
      }
    }

    return stylesMap
  }, [selectedSquare, legalMoves])

  return (
    <div ref={containerRef} className={styles.boardWrapper} aria-label="Chess board">
      <Chessboard
        key={boardWidth}
        boardWidth={boardWidth}
        position={currentFen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={boardFlipped ? 'black' : 'white'}
        customArrows={bestMoveArrows}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        animationDuration={150}
        areArrowsAllowed={false}
        arePiecesDraggable={!isGameOver && !isEngineTurn}
      />
    </div>
  )
}
