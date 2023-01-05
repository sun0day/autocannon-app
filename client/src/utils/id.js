export const genId = (prefix = 'test', n = 6) => {
  let random = (+`${Math.random()}`.slice(-n)).toString(16)
  if (random.length < n) {
    random += new Array(n - random.length).fill('0')
  }
  return prefix + '-' + random
}