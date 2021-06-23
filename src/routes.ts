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

                let n: number = todoPrio.length
                while (n > 1) {
                    for (let i = 0; i <= n - 2; i++) {
                        if (todoPrio[i].prio < todoPrio[i + 1].prio && todoPrio[i].fertig == 0) {
                            let hilf: Todo = todoPrio[i]
                            todoPrio[i] = todoPrio[i + 1]
                            todoPrio[i + 1] = hilf
                        }
                    }
                    n--
                }
                return res.send(todoPrio)
                break;
            }
        case "name":
            {
                const todoName: Todo[] = todos;

                let n: number = todoName.length
                while (n > 1) {
                    for (let i = 0; i <= n - 2; i++) {
                        if (todoName[i].name > todoName[i + 1].name && todoName[i].fertig == 0) {
                            let hilf: Todo = todoName[i]
                            todoName[i] = todoName[i + 1]
                            todoName[i + 1] = hilf
                        }
                    }
                    n--
                }
                return res.send(todoName)
                break;
            }
        case "gruppe":
            {
                const todoGruppe: Todo[] = todos;

                let n: number = todoGruppe.length
                while (n > 1) {
                    for (let i = 0; i <= n - 2; i++) {
                        if (todoGruppe[i].gruppe > todoGruppe[i + 1].gruppe && todoGruppe[i].fertig == 0) {
                            let hilf: Todo = todoGruppe[i]
                            todoGruppe[i] = todoGruppe[i + 1]
                            todoGruppe[i + 1] = hilf
                        }
                    }
                    n--
                }
                return res.send(todoGruppe)
                break;
            }
        case "id":
            {
                const todoID: Todo[] = todos;

                let n: number = todoID.length
                while (n > 1) {
                    for (let i = 0; i <= n - 2; i++) {
                        if (todoID[i].id > todoID[i + 1].id && todoID [i].fertig == 0) {
                            let hilf: Todo = todoID[i]
                            todoID[i] = todoID[i + 1]
                            todoID[i + 1] = hilf
                        }
                    }
                    n--
                }
                return res.send(todoID)
                break;
            }
        case "ende":
            {
                const todoEnde: Todo[] = todos;

                let n: number = todoEnde.length
                while (n > 1) {
                    for (let i = 0; i <= n - 2; i++) {
                        if (todoEnde[i].ende > todoEnde[i + 1].ende && todoEnde[i].fertig == 0) {
                            let hilf: Todo = todoEnde[i]
                            todoEnde[i] = todoEnde[i + 1]
                            todoEnde[i + 1] = hilf
                        }
                    }
                    n--
                }
                return res.send(todoEnde)
                break;
            }
            case "erstellt":
            {
                const todoErstellt: Todo[] = todos;

                let n: number = todoErstellt.length
                while (n > 1) {
                    for (let i = 0; i <= n - 2; i++) {
                        if (todoErstellt[i].erstellt > todoErstellt[i + 1].erstellt && todoErstellt[i].fertig == 0) {
                            let hilf: Todo = todoErstellt[i]
                            todoErstellt[i] = todoErstellt[i + 1]
                            todoErstellt[i + 1] = hilf
                        }
                    }
                    n--
                }
                return res.send(todoErstellt)
                break;
            }
        default: {
            return res.send(todos)
            break;
        }
    }
});

routes.get('/fertig', (req, res)  => 
{
    for (let u = 0; u < todos.length; u++) {
        if (req.query.id == todos[u].id.toString()) {
            todos[u].fertig = settings[1]
            settings[1] = settings[1] + 1
            fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
        }

    }
    let n: number = todos.length
    while (n > 1) {
        for (let i = 0; i <= n - 2; i++) {
            if (todos[i].fertig > todos[i + 1].fertig) {
                let hilf: Todo = todos[i]
                todos[i] = todos[i + 1]
                todos[i + 1] = hilf
            }
        }
        n--
    }
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
    todos.push({ id: settings[0], name: req.query.name, erstellt: zeit, ende: ende, gruppe: GruppeX, prio: req.query.prio, fertig: 0})
    res.send("Erstellt")
    settings[0] = settings[0] + 1
    
    fs.writeFileSync("./settings.json", JSON.stringify(settings, null, 4));
    fs.writeFileSync("./todos.json", JSON.stringify(todos, null, 4));
})

export default routes;