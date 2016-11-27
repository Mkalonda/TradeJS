import * as express from 'express';

module.exports = app => {

    const router = express.Router();

    router.post('/login', async (req, res) => {
        try {
            await app.controllers.system.loginBroker(req.body);
        } catch (err) {
            console.error(err);
            //app.debug({})
        }

        res.send('Birds home page')
    });

// define the about route
    router.get('/logout', function (req, res) {
        res.send('About birds')
    });

    return router;
};
