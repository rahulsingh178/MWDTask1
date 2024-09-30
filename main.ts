import { evaluate } from 'mathjs';


  export function evaluateFromMain(formula: any ) : number  {

//Scanner
// Define token types
enum TokenType {
    NUMBER,
    PLUS,
    MINUS,
    MUL,
    DIV,
    LPAREN,
    RPAREN,
    IDENTIFIER,
    EOF,
  }
  
  class Token {
    constructor(public type: TokenType, public value: string) {}
  }
  
  class Scanner {
    private pos = 0;
    private currentChar: string | null;
  
    constructor(private text: string) {
      this.currentChar = this.text[this.pos];
    }
  
    private advance() {
      this.pos++;
      this.currentChar = this.pos >= this.text.length ? null : this.text[this.pos];
    }
  
    private skipWhitespace() {
      while (this.currentChar !== null && /\s/.test(this.currentChar)) {
        this.advance();
      }
    }
  
    private number(): string {
      let result = '';
      while (this.currentChar !== null && /[0-9.]/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
      return result;
    }
  
    private identifier(): string {
      let result = '';
      while (this.currentChar !== null && /[a-zA-Z]/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
      return result;
    }
  
    getNextToken(): Token {
      while (this.currentChar !== null) {
        // Skip whitespace
        if (/\s/.test(this.currentChar)) {
          this.skipWhitespace();
          continue;
        }
  
        // Numbers (integer or float)
        if (/[0-9]/.test(this.currentChar)) {
          return new Token(TokenType.NUMBER, this.number());
        }
  
        // Identifiers (function names like sin, cos, etc.)
        if (/[a-zA-Z]/.test(this.currentChar)) {
          return new Token(TokenType.IDENTIFIER, this.identifier());
        }
  
        // Operators and parentheses
        switch (this.currentChar) {
          case '+':
            this.advance();
            return new Token(TokenType.PLUS, '+');
          case '-':
            this.advance();
            return new Token(TokenType.MINUS, '-');
          case '*':
            this.advance();
            return new Token(TokenType.MUL, '*');
          case '/':
            this.advance();
            return new Token(TokenType.DIV, '/');
          case '(':
            this.advance();
            return new Token(TokenType.LPAREN, '(');
          case ')':
            this.advance();
            return new Token(TokenType.RPAREN, ')');
          default:
            throw new Error(`Unknown character: ${this.currentChar}`);
        }
      }
  
      return new Token(TokenType.EOF, '');
    }
  }

  abstract class ASTNode {}

class NumberNode extends ASTNode {
  constructor(public value: number) {
    super();
  }
}

class BinOpNode extends ASTNode {
  constructor(public left: ASTNode, public op: Token, public right: ASTNode) {
    super();
  }
}

class UnaryOpNode extends ASTNode {
  constructor(public op: Token, public node: ASTNode) {
    super();
  }
}

class FunctionCallNode extends ASTNode {
  constructor(public funcName: string, public arg: ASTNode) {
    super();
  }
}

class Parser {
    private currentToken: Token;
  
    constructor(private scanner: Scanner) {
      this.currentToken = this.scanner.getNextToken();
    }
  
    private eat(type: TokenType) {
      if (this.currentToken.type === type) {
        this.currentToken = this.scanner.getNextToken();
      } else {
        throw new Error(`Expected token type ${type}, but got ${this.currentToken.type}`);
      }
    }
  
    // <factor> ::= <number> | <bracketedExpression> | <functionCall>
    private factor(): ASTNode {
      const token = this.currentToken;
  
      if (token.type === TokenType.NUMBER) {
        this.eat(TokenType.NUMBER);
        return new NumberNode(parseFloat(token.value));
      } else if (token.type === TokenType.LPAREN) {
        this.eat(TokenType.LPAREN);
        const node = this.expression();
        this.eat(TokenType.RPAREN);
        return node;
      } else if (token.type === TokenType.IDENTIFIER) {
        const funcName = token.value;
        this.eat(TokenType.IDENTIFIER);
        this.eat(TokenType.LPAREN);
        const arg = this.expression();
        this.eat(TokenType.RPAREN);
        return new FunctionCallNode(funcName, arg);
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
        return new UnaryOpNode(token, this.factor());
      }
  
      throw new Error('Invalid factor');
    }
  
    // <term> ::= <factor> { ("*" | "/") <factor> }
    private term(): ASTNode {
      let node = this.factor();
  
      while (this.currentToken.type === TokenType.MUL || this.currentToken.type === TokenType.DIV) {
        const token = this.currentToken;
        if (token.type === TokenType.MUL) {
          this.eat(TokenType.MUL);
        } else if (token.type === TokenType.DIV) {
          this.eat(TokenType.DIV);
        }
        node = new BinOpNode(node, token, this.factor());
      }
  
      return node;
    }
  
    // <expression> ::= <term> { ("+" | "-") <term> }
    private expression(): ASTNode {
      let node = this.term();
  
      while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
        const token = this.currentToken;
        if (token.type === TokenType.PLUS) {
          this.eat(TokenType.PLUS);
        } else if (token.type === TokenType.MINUS) {
          this.eat(TokenType.MINUS);
        }
        node = new BinOpNode(node, token, this.term());
      }
  
      return node;
    }
  
    parse(): ASTNode {
      return this.expression();
    }
  }
  
  class Evaluator {
    visit(node: ASTNode): number {
      if (node instanceof NumberNode) {
        return node.value;
      }
  
      if (node instanceof BinOpNode) {
        const leftVal = this.visit(node.left);
        const rightVal = this.visit(node.right);
  
        switch (node.op.type) {
          case TokenType.PLUS:
            return leftVal + rightVal;
          case TokenType.MINUS:
            return leftVal - rightVal;
          case TokenType.MUL:
            return leftVal * rightVal;
          case TokenType.DIV:
            return leftVal / rightVal;
        }
      }
  
      if (node instanceof UnaryOpNode) {
        const value = this.visit(node.node);
        return -value;
      }
  
      if (node instanceof FunctionCallNode) {
        const argValue = this.visit(node.arg);
        switch (node.funcName) {
          case 'sin':
            return Math.sin(argValue);
          case 'cos':
            return Math.cos(argValue);
          case 'tan':
            return Math.tan(argValue);
          case 'sqrt':
            return Math.sqrt(argValue);
          case 'pow':
            return Math.pow(argValue, 2); // Example: hard-coded exponent 2
        }
      }
  
      throw new Error('Invalid AST node');
    }
  }
  
  
  const scannerInstance = new Scanner(formula);
const parserInstance = new Parser(scannerInstance);
const astInstance = parserInstance.parse();

const evaluatorInstance = new Evaluator();
const result = evaluatorInstance.visit(astInstance);

console.log(`Result: ${result}`);
return result

        // console.log(`Result: ${result}`);
  }
