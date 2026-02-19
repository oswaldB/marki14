// Fastify server with hello and health routes
const fastify = require('fastify')({ logger: true });

// Health check route
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Hello route
fastify.get('/hello', async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Fastify server running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
