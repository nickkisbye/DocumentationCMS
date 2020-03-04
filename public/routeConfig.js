const fs = require('fs');

let routeData = fs.readFileSync(__dirname + '/routes.json');
let routes = [JSON.parse(routeData)];

let routeConfig = {
    routes,
    getRoute: (path) => {
        let route = routes.map(route => route[path] ? 'template' : 'notfound');
        return `${__dirname}/views/${route}.html`
    },
    getDetails: (path) => {
        let route = routes.map(route => route[path] && { headline: route[path].headline, content: route[path].content });
        return route
    }
}

module.exports = routeConfig;