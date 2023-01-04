const autocannon = require('autocannon')

module.exports = class Tester {
  constructor(params) {
    this.status = 'ready'
    this.result = null
    this.tick = 0
    this.instance = autocannon(params)
    this.instance.on('start', () => {
      this.status = 'started'
    })
    this.instance.on('done', (err, result) => {
      this.status = err ? 'error' : 'done'
      this.result = err ? err : result
    })
    this.instance.on('tick', () => {
      this.tick++
    })
    this.instance.on('error', err => {
      this.status = 'error'
      this.result = err
    })
    this.instance.catch(err => {
      this.status = 'error'
      this.result = err
    })
  }
}