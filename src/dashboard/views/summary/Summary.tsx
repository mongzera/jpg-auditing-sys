import { useEffect, useRef, useState } from 'react';
import './Summary.css'
import { supabase } from '../../../supabase';
import { getUserOrgData } from '../../../utils/user-util';
import { getOrganizationAccounts } from '../../../utils/organization-utils';
import SummarizeAccounts from './SummarizeAccounts';


function Summary(){

    const [recentTransactions, setRecentTransactions] = useState<TransactionLog[] | null>();

    useEffect( ()=>{
        const fetchAll = async() => {
            
            const {data, error} = await supabase.from('tb_transaction_log').select('*, entry:tb_transaction_entries(id, account, entry, amount)').eq('organization_uuid', getUserOrgData()?.organization_id);
        
            if(error){
                alert(error.message);
                return;
            }

            console.log(data);

            const orgChartOfAccounts = getOrganizationAccounts();

            const formattedTransactionLogs = data.map((item)=>{
                const formattedItem = item as TransactionLog

                //only count one side entry [debit] since both must be equal
                let amount = 0;
                formattedItem.entry.forEach((transact_entry)=>{
                    const org_account = orgChartOfAccounts?.find(item=>item.uuid === transact_entry.account);

                    transact_entry.account_type = org_account?.account_type ?? "NULL";
                    transact_entry.account_name = org_account?.account_name ?? "NULL"
                    if(transact_entry.entry === 'DEBIT') amount += transact_entry.amount;
                });

                formattedItem.amount = amount;

                return formattedItem;
            });

            setRecentTransactions(formattedTransactionLogs);
        }

        fetchAll();
    }, []); 

    return (
        <>
            <div className="jgrid">
                
                <SummarizeAccounts title="Assets" account_type="ASSETS" transactions={recentTransactions} style={{gridColumnStart:1, gridColumnEnd:1, gridRowStart:1, gridRowEnd:2}}></SummarizeAccounts>
                <SummarizeAccounts title="Expenses" account_type="EXPENSE" transactions={recentTransactions} style={{gridColumnStart:2, gridColumnEnd:2, gridRowStart:1, gridRowEnd:2}}></SummarizeAccounts>
                <SummarizeAccounts title="Liabilities" account_type="LIABILITY" transactions={recentTransactions} style={{gridColumnStart:3, gridColumnEnd:3, gridRowStart:1, gridRowEnd:2}}></SummarizeAccounts>
                <SummarizeAccounts title="Revenue" account_type="REVENUE" transactions={recentTransactions} style={{gridColumnStart:4, gridColumnEnd:4, gridRowStart:1, gridRowEnd:2}}></SummarizeAccounts>

                {/* <div className="jcard jcard-small" style={{gridColumnStart:1, gridColumnEnd:1, gridRowStart:3, gridRowEnd:3}}>
                    <div className="jcard-header">
                        <h6>Collected Funds {'(AUGUST)'}: </h6>
                    </div>
                    <div className="jcard-content">
                        <h6>PHP 2540.02</h6>
                    </div>
                </div>

                <div className="jcard jcard-small" style={{gridColumnStart:2, gridColumnEnd:3, gridRowStart:3, gridRowEnd:3}}>
                    <div className="jcard-header">
                        <h6>Total Expense {'(AUGUST)'}: </h6>
                    </div>
                    <div className="jcard-content">
                        <h6>PHP 2540.02</h6>
                    </div>
                </div> */}

                <div className="jcard jcard-large"  style={{gridColumnStart:1, gridColumnEnd:5, gridRowStart:2, gridRowEnd:4}}>
                    <h4 className='weight-600'>Recent Transactions</h4>

                    <table className='jtable'>
                        <thead>
                            
                                <tr>
                                    <th scope='col'><h6>Description</h6></th>
                                    <th scope='col'><h6>Amount</h6></th>
                                    <th scope='col'><h6>Date</h6></th>
                                </tr>
                            
                            
                        </thead>
                        <tbody>
                            {
                                recentTransactions?.map( (item : TransactionLog)=> {
                                    return <>
                                        <RecentTransaction {...item}/>
                                        
                                    </>
                                })
                            }
                        </tbody>
                    </table>
                    
                </div>
            </div>
            
    
        </>
    );
}

export default Summary;

interface TransactionEntry{
    id : string,
    account : string,
    account_type : string,
    entry : string,
    amount : number,
    account_name : string
}

export interface TransactionLog{
    id : string,
    description : string,
    amount : number,
    created_at : string,
    entry : TransactionEntry[]
}

function RecentTransaction( props : TransactionLog){

    const [expanded, setExpanded] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement>(null);
    // const id = props.values.id;
    // const desc = props.values.description;
    // const type = props.values.type;
    // const amount : number = parseFloat(props.values.amount);
    // const date = props.values.date;

    useEffect( ()=>{
        if(!divRef.current) return;

        if(expanded) divRef.current!.style.height = divRef.current?.scrollHeight + 150 + 'px';
        else divRef.current!.style.height = '0px';
    }, [expanded]);

    return (
         <>
            <tr >
                <td ><h6 className={''}>{props.description}</h6></td>
                <td className='' >PHP {props.amount.toFixed(2)}</td>
                <td className='' >{props.created_at.split('T')[0]}</td> 
                <td><i className={'bi bi-chevron-' + (expanded ? 'up' : 'down')} onClick={()=>{setExpanded(!expanded)}}></i></td>
            </tr>

            {/* Collapsible draw for transaction entries*/}
            <tr>
                <td colSpan={4}>

                    <div ref={divRef} className={"d-flex flex-column justify-content-center w-100 px-5 collapsible-drawer "+ (expanded ? 'darken-drawer' : '')}>
                        <div className="d-flex flex-row mb-4">
                            <div className="d-flex w-50 ">
                                <h6>Account Name</h6>
                            </div>
                            <div className="d-flex flex-row justify-content-between align-items-center w-50">
                                <div className='d-flex w-50 justify-content-center'>
                                    <h6>Debit</h6>
                                </div>
                                <div className='d-flex w-50 justify-content-center'>
                                    <h6>Credit</h6>
                                </div>
                            </div>
                        </div>

                        {props.entry.map((entry) => {
                            return (
                                <>
                                    <div className="d-flex flex-row">
                                        <div className="d-flex w-50">
                                            <p className='m-0'>{entry.account_name}</p>
                                        </div>
                                        <div className="d-flex flex-row justify-content-between align-items-center w-50">
                                            <div className='d-flex w-50 justify-content-center'>
                                                <p className='m-0'>{entry.entry==='DEBIT' ? 'PHP ' + entry.amount.toFixed(2) : '-'}</p>
                                            </div>
                                            <div className='d-flex w-50 justify-content-center'>
                                                <p className='m-0'>{entry.entry==='CREDIT' ? 'PHP ' + entry.amount.toFixed(2) : '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        })}
                        <hr className='m-0 p-0'/>
                        <div className="d-flex flex-row">
                            <div className="d-flex w-50">
                                <h6 className='m-0'>Balance</h6>
                            </div>
                            <div className="d-flex flex-row justify-content-between align-items-center w-50">
                                <div className='d-flex w-50 justify-content-center'>
                                    <p className='m-0'>PHP {props.amount.toFixed(2)}</p>
                                </div>
                                <div className='d-flex w-50 justify-content-center'>
                                    <p className='m-0'>PHP {props.amount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className={"w-100 px-5 collapsible-drawer " + (expanded ? 'darken-drawer' : 'close')}>
                        <table className='w-100'>
                            <thead>
                                <tr >
                                    <th><h6 style={{textAlign:'left'}}>Account Name</h6></th>
                                    <th><h6 style={{textAlign:'center'}}>DEBIT</h6></th>
                                    <th><h6 style={{textAlign:'center'}}>CREDIT</h6></th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.entry.map((entry)=>{
                                    return (
                                        <>
                                            <tr>
                                                <td style={{textAlign:'left'}}>{entry.account_name}</td>
                                                <td style={{textAlign:'center'}}> {entry.entry==='DEBIT' ? 'PHP ' + entry.amount.toFixed(2) : '-'}</td>
                                                <td style={{textAlign:'center'}}> {entry.entry==='CREDIT' ? 'PHP ' + entry.amount.toFixed(2) : '-'}</td>
                                                <td></td>
                                            </tr>
                                        </>
                                    );
                                })}
                                <tr>
                                    <td style={{textAlign:'left'}}><b>Balance:</b> </td>
                                    <td style={{textAlign:'center'}}><b>PHP {props.amount.toFixed(2)}</b></td>
                                    <td style={{textAlign:'center'}}><b>PHP {props.amount.toFixed(2)}</b></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div> */}
                </td>
            </tr>
            
            
         </>
    );
}

