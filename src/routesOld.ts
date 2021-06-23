import { Console, time, timeStamp } from 'console';
import { TIMEOUT } from 'dns';
import { Router } from 'express';
import { Request, Response } from 'express';

let aktuelleID: number = 1

interface Todo {
    id: number;
    name: string;
    erstellt: string;
    ende: number;
    gruppe: string;
    prio: number;  //0 bis 3
}

const todos: Todo[] = [];

const routes = Router();

routes.get('/', (req, res) => 
{
    if (req.query.sortieren == "prio")
    {
        const todoPrio: Todo[] = todos;

        let n: number = todoPrio.length
        while(n>1)
        {
            for (let i=0; i<=n-2; i++)
            {
                if(todoPrio[i].prio < todoPrio[i+1].prio)
                {
                    let hilf: Todo = todoPrio[i]
                    todoPrio[i] = todoPrio[i+1]
                    todoPrio[i+1] = hilf
                }
            }
            n--
        }


        return res.send(todoPrio)
    }
    return res.send(todos);
});

routes.get('/fertig', (req, res)  => 
{
    for(let i=0; i< todos.length-1; i++)
    {
        if(todos[i].id.toString() == req.query.id)
        {
            
        }
    }
})

routes.post('/new', (req: Request<unknown, unknown, unknown, Todo>, res) => 
{
    let GruppeX: string;
    let ende: number;
    if (req.query.ende == undefined)
    {
        ende = 0
    }
    else
    {
        ende = req.query.ende
    }

    if(req.query.gruppe == undefined)
    {
        GruppeX = "Standard"
    }
    else
    {
        GruppeX = req.query.gruppe
    }

    let zeit: string = Date();
    todos.push({id: aktuelleID, name: req.query.name, erstellt: zeit, ende: ende, gruppe: GruppeX, prio: req.query.prio})
    res.send("Erstellt")
    aktuelleID++
  })

export default routes;