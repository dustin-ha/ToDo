import { Console, time, timeStamp } from 'console';
import { TIMEOUT } from 'dns';
import { Router } from 'express';
import { Request, Response } from 'express';
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

interface SettingsInterface {
    aktuelleID: number;
}

const settings: SettingsInterface = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const todos: Todo[] = JSON.parse(fs.readFileSync("./todos.json", "utf8"));

const routes = Router();

function sortieren(nachWas: string) {
    const todoSort: Todo[] = todos;
    switch (nachWas) {
        case "prio":
            {
                todoSort.sort(function (a, b) {
                    if (b.fertig == false) {
                        return a.prio - b.prio;
                    }
                    return 0
                });
                break;
            }
        case "name":
            {
                todoSort.sort(function (a, b) {
                    var nameA = a.name.toUpperCase();
                    var nameB = b.name.toUpperCase();
                    if (nameA < nameB && b.fertig == false) {
                        return -1;
                    }
                    if (nameA > nameB && b.fertig == false) {
                        return 1;
                    }
                    return 0;
                });
                break;
            }
        case "gruppe":
            {
                todoSort.sort(function (a, b) {
                    var nameA = a.gruppe.toUpperCase();
                    var nameB = b.gruppe.toUpperCase();
                    if (nameA < nameB && b.fertig == false) {
                        return -1;
                    }
                    if (nameA > nameB && b.fertig == false) {
                        return 1;
                    }
                    return 0;
                });
                break;
            }
        case "id":
            {
                todoSort.sort(function (a, b) {
                    if (b.fertig == false) {
                        return a.id - b.id;
                    }
                    return 0
                });
                break;
            }
        case "ende":
            {
                todoSort.sort(function (a, b) {
                    if (b.fertig == false) {
                        return a.ende - b.ende;
                    }
                    return 0
                });
                break;
            }
        default: {
            return todos

        }
    }
    return todoSort
}

routes.get('/', (req, res) => {
    switch (req.query.sortieren) {
        case "prio":
            {
                return res.send(sortieren("prio"))
            }
        case "name":
            {
                return res.send(sortieren("name"))
            }
        case "gruppe":
            {
                return res.send(sortieren("gruppe"))
            }
        case "id":
            {
                return res.send(sortieren("id"))
            }
        case "ende":
            {
                return res.send(sortieren("ende"))
            }
        case "erstellt neu":
            {
                return res.send(sortieren("id").reverse())
            }
        case "erstellt alt":
            {
                return res.send(sortieren("id"))
            }
        default: {
            return res.send(todos)
        }
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
    return res.send("Id not found")
})

routes.delete('/delete', (req, res) => {
    for (let i = 0; i < todos.length; i++) {
        if (req.query.id == todos[i].id.toString()) {
            todos[i].delete = true
            todos.sort(compareDelete)
            console.log(todos.pop())
            fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
            return res.send("Gelöscht")
        }
    }
})

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

routes.get('/fertig', (req, res) => {
    const todo = todos.find((todo) => todo.id == parseInt(req.query.id.toString()));
    todo.fertig = true
    todos.sort(compareFertig)
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
    return res.send(todos)
})

routes.post('/new', (req: Request<unknown, unknown, unknown, Todo>, res) => {
    let GruppeX: string;
    let ende: number;
    if (req.query.ende == undefined) {
        ende = 0
    }
    else {
        ende = req.query.ende
    }

    if (req.query.gruppe == undefined) {
        GruppeX = "Standard"
    }
    else {
        GruppeX = req.query.gruppe
    }

    let zeit: string = Date();
    todos.reverse()
    todos.push({ id: settings.aktuelleID, name: req.query.name, erstellt: zeit, ende: parseInt(req.query.ende.toString()), gruppe: GruppeX, prio: parseInt(req.query.prio.toString()), fertig: false, delete: false })
    todos.reverse()
    res.send("Erstellt")
    settings.aktuelleID++;

    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
})

export default routes;