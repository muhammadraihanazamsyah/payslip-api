// src/middlewares/authenticate.js
module.exports = async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
};
