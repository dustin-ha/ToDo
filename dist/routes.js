import { Router } from 'express';
import Mongo from 'mongodb';
import fs from "fs";
const mongoClient = new Mongo.MongoClient("mongodb://localhost:27017");
const connection = await mongoClient.connect();
const db = connection.db("ToDo");
const toDo = db.collection("todos");
const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const routes = Router();
routes.get('/', async (req, res) => {
    var _a, _b;
    const sortFunctions = {
        name: compareName,
        prio: comparePrio,
        gruppe: compareGruppe,
        Id: compareID,
        erstellt: compareErstellt,
        ende: compareEnde
    };
    console.log("Called");
    const todossort = await toDo.find().toArray();
    todossort.sort(compareFertig);
    const sort = (_a = req.query.sortieren) !== null && _a !== void 0 ? _a : "name";
    const richt = (_b = req.query.richtung) !== null && _b !== void 0 ? _b : "auf";
    if (req.query.richtung == "auf") {
        res.send(todossort.sort(sortFunctions[sort.toString()]));
    }
    else {
        res.send(todossort.sort(sortFunctions[sort.toString()]).reverse());
    }
});
routes.patch('/edit', async (req, res) => {
    var _a, _b, _c, _d;
    const todoX = await toDo.findOne({ id: parseInt(req.query.id.toString()) });
    let name = todoX.name;
    let gruppe = todoX.gruppe;
    let prio = todoX.prio;
    let ende = todoX.ende;
    let fertig = todoX.fertig;
    name = (_a = req.query.name) === null || _a === void 0 ? void 0 : _a.toString();
    gruppe = (_b = req.query.gruppe) === null || _b === void 0 ? void 0 : _b.toString();
    prio = parseInt((_c = req.query.prio) === null || _c === void 0 ? void 0 : _c.toString());
    ende = parseInt((_d = req.query.ende) === null || _d === void 0 ? void 0 : _d.toString());
    if (req.query.fertig == "true" || req.query.fertig == "True") {
        fertig = true;
    }
    console.log(name + gruppe + prio + ende + fertig);
    await toDo.updateOne({ id: parseInt(req.query.id.toString()) }, { $set: { name: name, gruppe: gruppe, prio: prio, ende: ende, fertig: fertig } });
    return res.send("Bearbeitet");
});
routes.delete('/delete', (req, res) => {
    toDo.deleteOne({ id: parseInt(req.query.id.toString()) });
    return res.send("Gelöscht");
});
routes.get('/fertig', async (req, res) => {
    await toDo.updateOne({ id: parseInt(req.query.id.toString()) }, { $set: { fertig: true } });
    const gottodos = await toDo.find().toArray();
    gottodos.sort(compareFertig);
    return res.send(gottodos);
});
routes.post('/new', async (req, res) => {
    var _a, _b, _c;
    const ende = (_a = req.query.ende) !== null && _a !== void 0 ? _a : 0;
    const gruppe = (_b = req.query.gruppe) !== null && _b !== void 0 ? _b : "Standard";
    const monat = new Date().getMonth() + 1;
    const zeit = new Date().getDate().toString() + "." + monat + "." + new Date().getFullYear() + " " + new Date().getHours() + ":" + new Date().getMinutes() + " Uhr";
    const prio = (_c = req.query.prio) !== null && _c !== void 0 ? _c : 0;
    await toDo.insert({ id: settings.aktuelleID, name: req.query.name, erstellt: zeit, ende: ende, gruppe: gruppe, prio: prio, fertig: false, delete: false });
    settings.aktuelleID++;
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
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
    var nameA = a.gruppe; //.toUpperCase();
    var nameB = b.gruppe; //.toUpperCase();
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
    var nameA = a.erstellt; //.toUpperCase();
    var nameB = b.erstellt; //.toUpperCase();
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
    var nameA = a.name; //.toUpperCase();
    var nameB = b.name; //.toUpperCase();
    if (nameA < nameB && b.fertig == false) {
        return -1;
    }
    if (nameA > nameB && b.fertig == false) {
        return 1;
    }
    return 0;
}
;
export default routes;
//# sourceMappingURL=routes.js.map