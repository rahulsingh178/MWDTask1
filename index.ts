import express, { Request, Response } from 'express';
// import { evaluate } from 'mathjs';
import { evaluate } from './main.ts';


//Start express application
const app = express();
const port = 3000;

//Parses incoming JSON requests and makes the requests available in req.body
app.use(express.json());


app.post('/evaluate', (req: Request, res: Response) => {

    const { formula } = req.body;

    try{ 
        const result = evaluate(formula);

        res.json({ success: true, result });
    }catch(error) {

        res.status(400).json({ success: false, error: String(error) });
    }
 });

 app.listen(port, () => {

    console.log('Server running at -- http://localhost:'+port);
 });
