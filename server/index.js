const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({ logger: true })
const Tester = require('./tester')
const cache = require('./cache');

const assetDir = path.join(__dirname, '../client/dist')

fastify.register(require('@fastify/static'), {
  root: assetDir,
  prefix: '/asset',
});

fastify.register(require('@fastify/formbody'));

fastify.setErrorHandler(function (error, request, reply) {
  // Log error
  this.log.error(error)
  // Send error response
  reply.status(500).send({ error: error.message })
})

fastify.get('/*', async (req, reply) => {
  const stream = fs.createReadStream(path.join(assetDir, './index.html'))

  return reply.type('text/html').send(stream)
});

fastify.get('/api/test', async (req, reply) => {
  const { tid } = req.query

  const tester = cache.get(tid)

  if (!tester) {
    return reply.send({ error: `${tid} not exist`, status: 'error', result: null })
  }

  return reply.send(tester)
})

fastify.post('/api/test', async (req, reply) => {
  const tester = new Tester(req.body)
  cache.set(req.body.tid, tester)
  return reply.send('start success')
});

async function start(port) {
  fastify.listen({ port, host: '0.0.0.0' });
}

process.on('uncaughtException', err => {
  console.error(err)
})

module.exports = { start }