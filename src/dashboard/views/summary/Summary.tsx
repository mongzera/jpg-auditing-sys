import { useEffect, useRef, useState } from 'react';
import './Summary.css'
import { supabase } from '../../../supabase';
import { getUserOrgData } from '../../../utils/user-util';
import { fetchOrganizationTransactions, getOrganizationAccounts, type TransactionLog } from '../../../utils/organization-utils';
import SummarizeAccounts from './SummarizeAccounts';


function Summary(){

    const [recentTransactions, setRecentTransactions] = useState<TransactionLog[] | null>();

    useEffect( ()=>{
        const fetchAll = async() => {
            const formattedTransactionLogs = await fetchOrganizationTransactions();
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

        if(expanded) {

            //clone the target 
            let divClone = divRef.current.cloneNode(true) as HTMLDivElement;
            divClone.id = 'clone';
            divClone.style.height = 'min-content';
            divClone.style.position = "absolute";  // remove from layout flow
            divClone.style.visibility = "hidden";  // hide it
            divClone.style.whiteSpace = "nowrap"; 
            
            divRef.current.appendChild(divClone);

            const height = divClone.scrollHeight + 50;

            divRef.current.removeChild(divClone);

            divRef.current!.style.height = height + 'px';

        }
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

                        {props.entries.map((entry) => {

                            return (
                                <>
                                    <div className="d-flex flex-row">
                                        <div className="d-flex w-50">
                                            <p className='m-0'> {entry.account_name}<b>{(!!entry.member_paid && entry.entry === 'DEBIT' ? ` (${entry.member_paid} ${entry.or_number})` : '')}</b> </p>
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

