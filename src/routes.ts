import { Console, time, timeStamp } from 'console';
import { TIMEOUT } from 'dns';
import { Router } from 'express';
import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import { idText } from 'typescript';

const fs = require("fs");
//const settings: number[] = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

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

async function mongo() {
    const mongoClient = new MongoClient("mongodb://localhost:27017")
    const connection = await mongoClient.connect()
    const db = connection.db("ToDo")
    const toDo = db.collection<Todo>("todos")

    console.log(await toDo.insert({ id: 1, name: "" }))

}
interface SettingsInterface {
    aktuelleID: number;
}

const settings: SettingsInterface = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const todos: Todo[] = JSON.parse(fs.readFileSync("./todos.json", "utf8"));

const routes = Router();

routes.get('/', (req, res) => {
    const sortFunctions: Record<string, (a: Todo, b: Todo) => number> = {
        name: compareName,
        prio: comparePrio,
        gruppe: compareGruppe,
        Id: compareID,
        erstellt: compareErstellt,
        ende: compareEnde
    }

    if (req.query.richtung == "auf") {
        res.send(todos.sort(sortFunctions[req.query.sortieren.toString() ?? "name"]))
    }
    else {
        res.send(todos.sort(sortFunctions[req.query.sortieren.toString() ?? "name"]).reverse())
    }
});


routes.patch('/edit', async (req, res) => {
    const todoF: Todo = todos.find((todo) => todo.id == parseInt(req.query.id.toString()));
    await mongo()
    if (todoF != undefined) {
        if (req.query.name != undefined) {
            todoF.name = req.query.name.toString();
        }
        if (req.query.gruppe != undefined) {
            todoF.gruppe = req.query.gruppe.toString();
        }
        if (req.query.prio != undefined) {
            todoF.prio = parseInt(req.query.prio.toString());
        }
        if (req.query.ende != undefined) {
            todoF.ende = parseInt(req.query.ende.toString());
        }
        if (req.query.fertig != undefined) {
            if (req.query.fertig == "true" || req.query.fertig == "True") {
                todoF.fertig = true;
            }
            else {
                todoF.fertig = false;
            }
            todos.sort(compareFertig);
        }
        fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
        return res.send(todoF);
    }
    return res.send("Id not found")
})

routes.delete('/delete', (req, res) => {
    const todoF: Todo = todos.find((todo) => todo.id == parseInt(req.query.id.toString()));
    if (todoF != undefined) {
        todoF.delete = true
        todos.sort(compareDelete)
        const del: Todo = todos.pop()
        fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
        return res.send(del)
    }
    return res.send("Id not found")
})



routes.get('/fertig', (req, res) => {
    const todo = todos.find((todo) => todo.id == parseInt(req.query.id.toString()));
    todo.fertig = true
    todos.sort(compareFertig)
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
    return res.send(todos)
})

routes.post('/new', (req: Request<unknown, unknown, unknown, Todo>, res) => {
    const ende: number = req.query.ende ?? 0
    const gruppe: string = req.query.gruppe.toString() ?? "Standard"
    const zeit: string = Date();
    const prio: number = req.query.prio ?? 0

    todos.reverse()
    todos.push({ id: settings.aktuelleID, name: req.query.name, erstellt: zeit, ende: ende, gruppe: gruppe, prio: prio, fertig: false, delete: false })
    todos.reverse()

    settings.aktuelleID++;
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
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
