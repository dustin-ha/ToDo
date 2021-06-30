import { Console, time, timeStamp } from 'console';
import { TIMEOUT } from 'dns';
import { Router } from 'express';
import { Request, Response } from 'express';
import Mongo from 'mongodb';
import { idText } from 'typescript';
import fs from "fs";

interface Todo {
    id: number;
    name: string;
    erstellt: string;
    ende: number;
    gruppe: string;
    prio: number;  //0 bis 3
    fertig: boolean;
    delete: boolean;
}

const mongoClient = new Mongo.MongoClient("mongodb://localhost:27017")
const connection = await mongoClient.connect()
const db = connection.db("ToDo")
const toDo = db.collection<Todo>("todos")

interface SettingsInterface {
    aktuelleID: number;
}
const settings: SettingsInterface = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

const routes = Router();

routes.get('/', async (req, res) => {
    const sortFunctions: Record<string, (a: Todo, b: Todo) => number> = {
        name: compareName,
        prio: comparePrio,
        gruppe: compareGruppe,
        Id: compareID,
        erstellt: compareErstellt,
        ende: compareEnde
    }
    console.log("Called")
    const todossort: Todo[] = await toDo.find().toArray()
    todossort.sort(compareFertig);
    const sort = req.query.sortieren ?? "name"
    if (req.query.richtung == "auf") {
        res.send(todossort.sort(sortFunctions[sort.toString()]))
    }
    else {
        res.send(todossort.sort(sortFunctions[sort.toString()]).reverse())
    }

});


routes.patch('/edit', async (req, res) => {
    const todoX = await toDo.findOne({ id: parseInt(req.query.id.toString()) })
    const name: string = req.query.name.toString() ?? todoX.name
    const gruppe: string = req.query.gruppe.toString() ?? todoX.gruppe
    const prio: number = parseInt(req.query.prio.toString()) ?? todoX.prio
    const ende: number = parseInt(req.query.name.toString()) ?? todoX.ende
    let fertig = false;
    if (req.query.fertig == "true" || req.query.fertig == "True") {
        fertig = true;
    }
    await toDo.updateOne({ id: parseInt(req.query.id.toString()) }, { $set: { name: name, gruppe: gruppe, prio: prio, ende: ende, fertig: fertig } })
    return res.send("Bearbeitet")
})

routes.delete('/delete', (req, res) => {
    toDo.deleteOne({ id: parseInt(req.query.id.toString()) })
    return res.send("Gelöscht")
})

routes.get('/fertig', async (req, res) => {
    await toDo.updateOne({ id: parseInt(req.query.id.toString()) }, { $set: { fertig: true } })
    const gottodos: Todo[] = await toDo.find().toArray()
    gottodos.sort(compareFertig);
    return res.send(gottodos)
})

routes.post('/new', async (req: Request<unknown, unknown, unknown, Todo>, res) => {
    const ende: number = req.query.ende ?? 0
    const gruppe: string = req.query.gruppe ?? "Standard"
    const zeit: string = "Jetzt"//Date();
    const prio: number = req.query.prio ?? 0
    await toDo.insert({ id: settings.aktuelleID, name: req.query.name, erstellt: zeit, ende: ende, gruppe: gruppe, prio: prio, fertig: false, delete: false })
    settings.aktuelleID++;
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    res.send("Erstellt")
})

function comparePrio(a: Todo, b: Todo) {
    if (b.fertig == false) {
        return a.prio - b.prio;
    }
    return 0
}

function compareDelete(a: Todo, b: Todo) {
    if (a.delete == b.delete) {
        return 0;
    }
    if (a.delete && !b.delete) {
        return 1;
    }
    return -1;
}

function compareFertig(a: Todo, b: Todo) {
    if (a.fertig == b.fertig) {
        return 0;
    }
    if (a.fertig && !b.fertig) {
        return 1;
    }
}

function compareGruppe(a: Todo, b: Todo) {
    var nameA = a.gruppe.toUpperCase();
    var nameB = b.gruppe.toUpperCase();
    if (nameA < nameB && b.fertig == false) {
        return -1;
    }
    if (nameA > nameB && b.fertig == false) {
        return 1;
    }
}

function compareID(a: Todo, b: Todo) {
    if (b.fertig == false) {
        return a.id - b.id;
    }
    return 0
}

function compareErstellt(a: Todo, b: Todo) {
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

function compareEnde(a: Todo, b: Todo) {
    if (b.fertig == false) {
        return a.ende - b.ende;
    }
    return 0
}


function compareName(a: Todo, b: Todo) {
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
    if (nameA < nameB && b.fertig == false) {
        return -1;
    }
    if (nameA > nameB && b.fertig == false) {
        return 1;
    }
    return 0;
};

export default routes;
