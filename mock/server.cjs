const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('./mock/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.get('/api/users', (req, res) => {
    const db = router.db;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '40', 10), 1);
    const search = String(req.query.search || '').trim().toLowerCase();

    let users = db.get('users').value();

    if (search) {
        users = users.filter((u) => {
            const fullName = String(u.fullName || '').toLowerCase();
            const email = String(u.email || '').toLowerCase();
            return fullName.includes(search) || email.includes(search);
        });
    }

    const total = users.length;
    const start = (page - 1) * limit;
    const items = users.slice(start, start + limit);

    res.json({ items, total, page, limit });
});

server.use('/api', router);

server.listen(3001, () => {
    console.log('Mock API: http://localhost:3001');
});