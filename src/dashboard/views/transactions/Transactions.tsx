import ExpenseEntryComponent from './ExpenseEntryComponent';
import JournalEntryComponent from './JournalEntryComponent';

export interface TransactionUIProp{
    account_name : string,
    account_entry : string,
    account_amount : number
}


function Transactions(){

    return (
        <>
            <div className="jgrid">
                <JournalEntryComponent></JournalEntryComponent>
                <ExpenseEntryComponent></ExpenseEntryComponent>
            </div>
        </>
    );
}

export default Transactions;