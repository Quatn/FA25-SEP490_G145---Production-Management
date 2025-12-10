import check from "check-types"

export const numToFixedBounded = (num: number, min = 0.0001, max = 9999999, getFixNum = (n: number) => (check.greater(n, 1000)) ? 2 : 4) => {
  if (!check.number(num)) return num + ""
  if (check.less(num, min)) return `<${min}`
  if (check.greater(num, max)) return `>${max}`
  return num.toFixed(getFixNum(num)).replace(/\.?(0+)$/, '')
}
