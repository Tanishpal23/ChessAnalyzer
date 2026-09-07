if (typeof window !== 'undefined') {
  // @ts-expect-error - vitest jest-dom
  await import('@testing-library/jest-dom/vitest')
}
