"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const todos = JSON.parse(fs.readFileSync("./todos.json", "utf8"));
const routes = express_1.Router();
routes.get('/', (req, res) => {
    var _a, _b;
    const sortFunctions = {
        name: compareName,
        prio: comparePrio,
        gruppe: compareGruppe,
        Id: compareID,
        erstellt: compareErstellt,
        ende: compareEnde
    };
    if (req.query.richtung == "auf") {
        res.send(todos.sort(sortFunctions[(_a = req.query.sortieren.toString()) !== null && _a !== void 0 ? _a : "name"]));
    }
    else {
        res.send(todos.sort(sortFunctions[(_b = req.query.sortieren.toString()) !== null && _b !== void 0 ? _b : "name"]).reverse());
    }
});
routes.patch('/edit', (req, res) => {
    for (let i = 0; i < todos.length; i++) {
        if (req.query.id == todos[i].id.toString()) {
            if (req.query.name != undefined) {
                todos[i].name = req.query.name.toString();
            }
            if (req.query.gruppe != undefined) {
                todos[i].gruppe = req.query.gruppe.toString();
            }
            if (req.query.prio != undefined) {
                todos[i].prio = parseInt(req.query.prio.toString());
            }
            if (req.query.ende != undefined) {
                todos[i].ende = parseInt(req.query.ende.toString());
            }
            if (req.query.fertig != undefined) {
                if (req.query.fertig == "true" || req.query.fertig == "True") {
                    todos[i].fertig = true;
                }
                else {
                    todos[i].fertig = false;
                }
                todos.sort(compareFertig);
            }
            fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
            return res.send(todos[i]);
        }
    }
    return res.send("Id not found");
});
routes.delete('/delete', (req, res) => {
    for (let i = 0; i < todos.length; i++) {
        if (req.query.id == todos[i].id.toString()) {
            todos[i].delete = true;
            todos.sort(compareDelete);
            console.log(todos.pop());
            fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
            return res.send("Gelöscht");
        }
    }
});
routes.get('/fertig', (req, res) => {
    const todo = todos.find((todo) => todo.id == parseInt(req.query.id.toString()));
    todo.fertig = true;
    todos.sort(compareFertig);
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
    return res.send(todos);
});
routes.post('/new', (req, res) => {
    var _a, _b, _c;
    const ende = (_a = req.query.ende) !== null && _a !== void 0 ? _a : 0;
    const gruppe = (_b = req.query.gruppe.toString()) !== null && _b !== void 0 ? _b : "Standard";
    const zeit = Date();
    const prio = (_c = req.query.prio) !== null && _c !== void 0 ? _c : 0;
    todos.reverse();
    todos.push({ id: settings.aktuelleID, name: req.query.name, erstellt: zeit, ende: ende, gruppe: gruppe, prio: prio, fertig: false, delete: false });
    todos.reverse();
    settings.aktuelleID++;
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
    res.send("Erstellt");
});
function comparePrio(a, b) {
    if (b.fertig == false) {
        return a.prio - b.prio;
    }
    return 0;
}
function compareDelete(a, b) {
    if (a.delete == b.delete) {
        return 0;
    }
    if (a.delete && !b.delete) {
        return 1;
    }
    return -1;
}
function compareFertig(a, b) {
    if (a.fertig == b.fertig) {
        return 0;
    }
    if (a.fertig && !b.fertig) {
        return 1;
    }
}
function compareGruppe(a, b) {
    var nameA = a.gruppe.toUpperCase();
    var nameB = b.gruppe.toUpperCase();
    if (nameA < nameB && b.fertig == false) {
        return -1;
    }
    if (nameA > nameB && b.fertig == false) {
        return 1;
    }
}
function compareID(a, b) {
    if (b.fertig == false) {
        return a.id - b.id;
    }
    return 0;
}
function compareErstellt(a, b) {
    var nameA = a.erstellt.toUpperCase();
    var nameB = b.erstellt.toUpperCase();
    if (nameA < nameB && b.fertig == false) {
        return -1;
    }
    if (nameA > nameB && b.fertig == false) {
        return 1;
    }
    return 0;
}
function compareEnde(a, b) {
    if (b.fertig == false) {
        return a.ende - b.ende;
    }
    return 0;
}
function compareName(a, b) {
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
    if (nameA < nameB && b.fertig == false) {
        return -1;
    }
    if (nameA > nameB && b.fertig == false) {
        return 1;
    }
    return 0;
}
;
exports.default = routes;
//# sourceMappingURL=routes.js.map