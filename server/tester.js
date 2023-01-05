const autocannon = require('autocannon')

module.exports = class Tester {
  constructor(params) {
    this.status = 'ready'
    this.result = null
    this.error = null
    this.tick = 0
    this.instance = autocannon(params)
    this.instance.on('start', () => {
      this.status = 'processing'
    })
    this.instance.on('done', result => {
      this.status = 'success'
      this.result = result
    })
    this.instance.on('tick', () => {
      this.tick++
    })
    this.instance.on('error', err => {
      this.status = 'error'
      this.error = err
    })
    this.instance.catch(err => {
      this.status = 'error'
      this.error = err
    })
  }
}