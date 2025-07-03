import { useEffect, useState } from "react";
import { getOrganizationAccounts, type TransactionLog } from "../../../utils/organization-utils";

interface SummarizeAccountProp{
    title : string,
    account_type : string,
    transactions : TransactionLog[] | null | undefined,
    style : object
}

interface AccountBalance{
    account_name : string,
    account_normal_balance : string
    account_balance : number,
    
}

function SummarizeAccounts(props : SummarizeAccountProp){
    const {title, account_type, transactions, style} = props;
    const [accountSummary, setAccountSummary] = useState<AccountBalance[] | null>();
    const [loading, setLoading] = useState(true);

    const fetchAll = async() =>{
        const organizationAccounts = await getOrganizationAccounts();
        const accounts : AccountBalance[]= [];

        if(!transactions){
            setLoading(false)
            return;
        }

        console.log('TRANSACTIONS: ', transactions);

        transactions?.forEach((transaction)=>{
            
            transaction.entries.forEach((entry)=>{
                
                if(entry.account_type === account_type){
                    //find if entry account name exists in accounts
                    const account = accounts.find((account)=>account.account_name === entry.account_name);
                    if(!!account){ //exists
                        //if entry is the same as the account's normal balance then they add, otherwise they subtract
                        (entry.entry === account.account_normal_balance) ? account.account_balance += entry.amount : account.account_balance-=entry.amount;
                    }
                    
                    else{
                        const normal_balance = organizationAccounts!.find((orgAccount)=>orgAccount.account_name === entry.account_name)?.account_normal_balance ?? 'NULL';

                        accounts.push({
                            account_name : entry.account_name,
                            account_normal_balance : normal_balance,
                            account_balance : (normal_balance === entry.entry) ? entry.amount : -entry.amount
                        });
                    }
                    
                }
            });
        });

        setLoading(false);
        setAccountSummary(accounts);
    }

    useEffect(()=>{
        fetchAll();
    }, [props]);

    if(loading){
        return <h6>Loading...</h6>
    }

    return (
        <>
            <div className="jcard jcard-small" style={style}>
                <div className="jcard-header"><h5>{title}</h5></div>
                <div className="jcard-content">
                    {accountSummary?.map((account)=>{
                        return (
                            <div className="d-flex flex-row justify-content-between">
                                <div className="left" style={{width: '250px', textAlign:'left'}}><p style={{fontSize:'0.75rem', margin: '0px'}}>{account.account_name}</p></div>
                                <div className="right" style={{width: '250px', textAlign:'right'}}><h6 style={{fontSize:'0.75rem'}}>PHP {account.account_balance.toFixed(2)}</h6></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default SummarizeAccounts;