import { Console, time, timeStamp } from 'console';
import { TIMEOUT } from 'dns';
import { Router } from 'express';
import { Request, Response } from 'express';

const fs = require("fs");

const settings: number[] = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

interface Todo {
    id: number;
    name: string;
    erstellt: string;
    ende: number;
    gruppe: string;
    prio: number;  //0 bis 3
    fertig: number;
}

const todos: Todo[] = JSON.parse(fs.readFileSync("./todos.json", "utf8"));

const routes = Router();

routes.get('/', (req, res) => {
    switch (req.query.sortieren) {
        case "prio":
            {
                const todoPrio: Todo[] = todos;
                todoPrio.sort(function (a, b) {
                    if (b.fertig == 0) {
                        return a.prio - b.prio;
                    }
                    return 0
                });
                return res.send(todoPrio)
                break;

            }
        case "name":
            {
                const todoName: Todo[] = todos;
                todoName.sort(function (a, b) {
                    var nameA = a.name.toUpperCase();
                    var nameB = b.name.toUpperCase();
                    if (nameA < nameB && b.fertig == 0) {
                        return -1;
                    }
                    if (nameA > nameB && b.fertig == 0) {
                        return 1;
                    }
                    return 0;
                });
                return res.send(todoName)
                break;
            }
        case "gruppe":
            {
                const todoGruppe: Todo[] = todos;
                todoGruppe.sort(function (a, b) {
                    var nameA = a.gruppe.toUpperCase();
                    var nameB = b.gruppe.toUpperCase();
                    if (nameA < nameB && b.fertig == 0) {
                        return -1;
                    }
                    if (nameA > nameB && b.fertig == 0) {
                        return 1;
                    }
                    return 0;
                });
                return res.send(todoGruppe)
                break;
            }
        case "id":
            {
                const todoID: Todo[] = todos;
                todoID.sort(function (a, b) {
                    if (b.fertig == 0) {
                        return a.id - b.id;
                    }
                    return 0
                });
                return res.send(todoID)
                break;
            }
        case "ende":
            {
                const todoEnde: Todo[] = todos;
                todoEnde.sort(function (a, b) {
                    if (b.fertig == 0) {
                        return a.ende - b.ende;
                    }
                    return 0
                });
                return res.send(todoEnde)
                break;
            }
        case "erstellt":
            {
                const todoErstellt: Todo[] = todos;
                todoErstellt.sort(function (a, b) {
                    var nameA = a.erstellt.toUpperCase();
                    var nameB = b.erstellt.toUpperCase(); m
                    if (nameA < nameB && b.fertig == 0) {
                        return -1;
                    }
                    if (nameA > nameB && b.fertig == 0) {
                        return 1;
                    }
                    return 0;
                });
                return res.send(todoErstellt)
                break;
            }
        default: {
            return res.send(todos)
            break;
        }
    }
});

routes.get('/fertig', (req, res) => {
    const index: number = todos.id.findIndex(req.query.id)
    todos[index].fertig = settings[1]
    settings[1]++
    todos.sort(function (a, b) {
        return a.ende - b.ende;
    });
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
    todos.push({ id: settings[0], name: req.query.name, erstellt: zeit, ende: ende, gruppe: GruppeX, prio: req.query.prio, fertig: 0 })
    res.send("Erstellt")
    settings[0] = settings[0] + 1

    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
})

export default routes;