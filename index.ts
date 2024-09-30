import express, { Request, Response } from 'express';
import { evaluate } from 'mathjs';

const app = express();
const port = 3000;

app.use(express.json());

function isValidFormula(formula: string): boolean {
    const allowedCharacters = /^[0-9+\-*/^(). x]*$/;
    return allowedCharacters.test(formula);
  }



app.post('/evaluate', (req: Request, res: Response) => {

    const { formula, variables } = req.body;

    if (!isValidFormula(formula)){
        return res.status(400).json({ succes:false, error: "Invalid formula"});
    }

    try{ 
        const result = evaluate(formula, variables);

        res.json({ success: true, result });
    }catch(error) {

        res.status(400).json({ success: false, error: String(error) });
    }
 });

 app.listen(port, () => {

    console.log('Server running at -- http://localhost:'+port);
 });