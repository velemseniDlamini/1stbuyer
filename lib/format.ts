export function formatRand(value: number, opts?: { decimals?: boolean }) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: opts?.decimals ? 2 : 0,
    minimumFractionDigits: opts?.decimals ? 2 : 0,
  })
    .format(value)
    .replace('ZAR', 'R')
    .replace(/\s/g, ' ')
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-ZA').format(value)
}
