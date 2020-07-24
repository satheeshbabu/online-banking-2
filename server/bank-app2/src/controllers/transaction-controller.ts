import { Router, Request, Response, NextFunction } from "express";
import { BadRequest } from "../exceptions/bad-request";
import { Principal } from "../entities/Principal";
import { Transaction, TransactionType } from "../entities/Transaction";
import { TransactionService } from "../services/transaction-service";
import { validateTransaction } from "../utils/validator";
import { ServerError } from "../exceptions/server-error";
import { AccountService } from "../services/account-service";

export function transactionController() {

    let transactionService: TransactionService = TransactionService.prototype.Factory();
    let accountService: AccountService = AccountService.prototype.Factory();
    let router = Router();

    router.get("/account/:accNumber", async (req: Request, res: Response) => {
        try {
            if(!res.locals.authorization) throw new BadRequest("User is not authenticated");
            let principal: Principal = JSON.parse(res.locals.authorization.data);
            let accNumber = req.params["accNumber"];
            let match = await accountService.matchAccountByUserId(accNumber, principal.id);
            if(!match) throw new BadRequest("Unauthorized User");
            let transactions = await transactionService.getTransactionsByAccountNumber(accNumber);
            res.status(200).send(transactions);
        } catch(e) {
            res.status(e.status).send(e);
        }
    });

    router.post("/simple", postTransactionMiddleware, async (req: Request, res: Response) => {
        try {
            if((req.body.type != TransactionType.DEPOSIT && req.body.type != TransactionType.WITHDRAW) || req.body.fromAcc != req.body.toAcc) throw new BadRequest("Invalid Request");
            let principal: Principal = JSON.parse(res.locals.authorization.data);
            let transaction: Transaction = new Transaction(req.body.fromAcc,req.body.toAcc, req.body.type, req.body.value);

            let worked = await transactionService.simpleTransaction(transaction, principal);
            if(!worked) throw new ServerError("Something bad happened");
            res.status(200).send("Transaction was successful");
        } catch(e) {
            res.status(e.status).send(e);
        }
    });

    router.post("/transfer", postTransactionMiddleware, async (req: Request, res: Response) => {
        try {
            if(req.body.type != TransactionType.TRANSFER || req.body.fromAcc == req.body.toAcc) throw new BadRequest("Invalid Request");
            let principal: Principal = JSON.parse(res.locals.authorization.data);
            let transaction: Transaction = new Transaction(req.body.fromAcc,req.body.toAcc, req.body.type, req.body.value);
            
            let worked = await transactionService.transfer(transaction, principal);
            if(!worked) throw new ServerError("Something bad happened");
            res.status(200).send("Transaction was successful");
        } catch(e) {
            res.status(e.status).send(e);
        }
    });

    return router;
}

function postTransactionMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        validateTransaction(req);
        if(!res.locals.authorization) throw new BadRequest("User is not authenticated");
        next();
    } catch(e) {
        res.status(e.status).send(e);
    }
}