import * as express from 'express';

module.exports = app => {

    const router = express.Router();

    router.post('/login', async (req, res) => {
        try {
            let result = await app.controllers.system.loginBroker(req.body);
            console.log(result);
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(401);
            //app.debug({})
        }
    });

// define the about route
    router.get('/logout', function (req, res) {
        res.send('About birds')
    });

    return router;
};
