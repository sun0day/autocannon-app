module.exports = (prefix = 'test', n = 6) => {
  return prefix + '-' + (+`${Math.random()}`.slice(-n)).toString(16)
}