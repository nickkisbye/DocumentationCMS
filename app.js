const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs');

const routeConfig = require('./public/routeConfig');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log("App listening on port 3000");
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/views/home.html`);
});

/**
 * Used to fetch the routes to the navigation.
 */

app.get('/routes', (req, res) => {
    let routes = [];
    routeConfig.routes.map(route => {
        Object.keys(route).map(key => {
            routes.push({ url: route[key].url, headline: route[key].headline })
        })
    })
    res.send(routes);
});

/**
 * Route for static html pages. works dynamically with the routes.json file.
 */

app.get('/:page', (req, res) => {
    res.sendFile(routeConfig.getRoute(req.params.page));
});

/**
 * Api routes
 */

app.get('/details/:page', (req, res) => {
    res.send(routeConfig.getDetails(req.params.page));
});

app.post('/newpage', (req, res) => {
    const { headline } = req.body.data;
    const trimmedHeadline = headline.toLowerCase().split(' ').join('');
    fs.readFile(__dirname + '/public/routes.json', 'utf8', function readFileCallback(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        obj = ({
            ...obj,
            [trimmedHeadline]: {
                "filename": trimmedHeadline,
                "url": trimmedHeadline,
                "headline": headline,
                "content": ''
            }
        });
        json = JSON.stringify(obj);
        fs.writeFile(__dirname + '/public/routes.json', json, 'utf8', () => {
            console.log("updated!");
        });
    });
    res.send({ headline });
});

app.put('/editpage/:page', (req, res) => {
    const { body, headline } = req.body;
    let trimmedHeadline = headline.toLowerCase().split(' ').join('');

    fs.readFile(__dirname + '/public/routes.json', 'utf8', function readFileCallback(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        for (let key in obj) {
            if (key === req.params.page) {
                obj[key].headline = headline;
                obj[key].content = body;
                obj[key].url = trimmedHeadline;
                obj[key].filename = trimmedHeadline;
            }
        }
        json = JSON.stringify(obj);
        json = json.replace(`"${req.params.page}"`, `"${trimmedHeadline}"`)
        fs.writeFile(__dirname + '/public/routes.json', json, 'utf8', () => {
            console.log("updated!");
        });
    })
    res.send({ headline: headline, content: body });
});

app.delete('/deletepage/:page', (req, res) => {
    fs.readFile(__dirname + '/public/routes.json', 'utf8', function readFileCallback(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        for (let key in obj) {
            if (key === req.params.page) {
                delete obj[key];
            }
        }
        json = JSON.stringify(obj);
        fs.writeFile(__dirname + '/public/routes.json', json, 'utf8', () => {
            console.log("updated!");
        });
    })
    res.send({ message: "deleted" });
});