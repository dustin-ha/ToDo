"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
let aktuelleID = 1;
const todos = [];
const routes = express_1.Router();
routes.get('/', (req, res) => {
    if (req.query.sortieren == "prio") {
        const todoPrio = todos;
        let n = todoPrio.length;
        while (n > 1) {
            for (let i = 0; i <= n - 2; i++) {
                if (todoPrio[i].prio < todoPrio[i + 1].prio) {
                    let hilf = todoPrio[i];
                    todoPrio[i] = todoPrio[i + 1];
                    todoPrio[i + 1] = hilf;
                }
            }
            n--;
        }
        return res.send(todoPrio);
    }
    return res.send(todos);
});
routes.get('/fertig', (req, res) => {
    for (let i = 0; i < todos.length - 1; i++) {
        if (todos[i].id.toString() == req.query.id) {
        }
    }
});
routes.post('/new', (req, res) => {
    let GruppeX;
    let ende;
    if (req.query.ende == undefined) {
        ende = 0;
    }
    else {
        ende = req.query.ende;
    }
    if (req.query.gruppe == undefined) {
        GruppeX = "Standard";
    }
    else {
        GruppeX = req.query.gruppe;
    }
    let zeit = Date();
    todos.push({ id: aktuelleID, name: req.query.name, erstellt: zeit, ende: ende, gruppe: GruppeX, prio: req.query.prio });
    res.send("Erstellt");
    aktuelleID++;
});
exports.default = routes;
//# sourceMappingURL=routesOld.js.map