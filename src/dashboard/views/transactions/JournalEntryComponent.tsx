import { useEffect, useRef, useState } from "react";
import type { TransactionUIProp } from "./Transactions";
import Select from "../../../widgets/Select";
import Input from "../../../widgets/Input";
import { supabase } from "../../../supabase";
import { getUserOrgData } from "../../../utils/user-util";
import { fetchOrganizationAccountsTypes, getOrganizationAccounts } from "../../../utils/organization-utils";
import Modal from "../../../widgets/Modal";

const JournalEntryComponent = () => {

        const [transactionInstances, setTransactionInstances] = useState<TransactionUIProp[]>([]);
        const [balanced, setBalanced] = useState<boolean>(false);
        const [openNewAccountModal, setOpenNewAccountModal] = useState<boolean>(false);
        const accountNameRef = useRef<string>("");
        const entryRef = useRef<string>("")
        const amountRef = useRef<string>("");
        const transactionDescriptionRef = useRef<string>("");
        const [organizationAccountNames, setOrganizationAccountNames] = useState<string[]>();
        const [refresh, setRefresh] = useState<number>(0);
    

        useEffect( ()=>{
            const fetchData = async () => {
                await fetchOrganizationAccountsTypes();
                const organizationAccounts = getOrganizationAccounts();

                const organizationNames : string[] = organizationAccounts?.map( (item) => {
                    return item.account_name
                }) ?? [];

                setOrganizationAccountNames(organizationNames)
            }

            fetchData();
            setTransactionInstances([]);
            
        }, [refresh]);

        const displayNewEntryModal = () => {
            return (
                <>
                    <div className='d-flex flex-row px-5 py-5'>
                        <div className="mx-2">
                            <Select label='Select Account' choices={organizationAccountNames} valueRef={accountNameRef}></Select>
                        </div>
                        <div className="mx-2">
                            <Select label='Entry' choices={['DEBIT', 'CREDIT']} valueRef={entryRef}></Select>
                        </div>
                        <div className="mx-2">
                            <Input id='amount_input' label='Amount' type='text' valueRef={amountRef} className='jinput-200'></Input>
                        </div>
                    </div>
                </>
            );
        }

        const clearModalInputs = () => {
            accountNameRef.current = '';
            entryRef.current = '';
            amountRef.current = '';

            const _amountInput = (document.getElementById('amount_input') as HTMLInputElement | null);
            if(_amountInput){
                _amountInput.value = '';
                _amountInput.focus();
            }
        }

        const clearTransactionDescription = () =>{
            transactionDescriptionRef.current = '';
            const _descriptionInput = (document.getElementById('_journal_entry_transaction_input') as HTMLInputElement | null);
            if(_descriptionInput){
                _descriptionInput.value = '';
                _descriptionInput.focus();
            }
        }

        const toggleNewEntryModal = () => {
            clearModalInputs();
            setOpenNewAccountModal(!openNewAccountModal);
        }

        const addNewEntry = () => {
            const accountNameRegex = /^.{3,}$/;
            const entryRegex = /^(CREDIT|DEBIT)$/; 
            const amountRegex = /^\d+(\.\d{1,2})?$/;

            if(!accountNameRegex.test(accountNameRef.current)){
                alert("Account Name invalid!");
                return;
            }

            if(!entryRegex.test(entryRef.current)){
                alert("Entry is invalid! (CREDIT | DEBIT)");
                return;
            }

            if(!amountRegex.test(amountRef.current)){
                alert("Amount is invalid! No negative amount is allowed and only 2 decimal places");
                return;
            }

            const transaction : TransactionUIProp = {
                account_name : accountNameRef.current,
                account_entry : entryRef.current,
                account_amount : parseFloat(amountRef.current)
            }

            setTransactionInstances( (prev) => [...prev, transaction]);
        }

        const deleteTransaction = async(transaction_id : string) => {
            const { error } = await supabase.from('tb_transaction_log').update({is_deleted : true}).eq('id', transaction_id);

            if(error){
                alert('There has been a data corruptions error\nPlease take a screenshot and contact JPG officer ASAP');
                return;
            }
        }

        const createTransaction = async() => {
            if(!transactionDescriptionRef.current){
                alert("Transaction Description must not be empty");
                return;
            }

            const {data : transaction_log_data, error} = await supabase.from('tb_transaction_log').insert({
                description : transactionDescriptionRef.current,
                organization_uuid : getUserOrgData()?.organization_id
            }).select().single();

            if(error){
                alert(error.message);
                return;
            }

            const transaction_log_id = transaction_log_data.id;

            const transaction_entries :object[] = [];

            const organization_accounts = getOrganizationAccounts();

            if(!organization_accounts){
                alert("Cannot find organization chart of accounts!");
                deleteTransaction(transaction_log_id);
                return;
            }

            let hasError = false;

            console.log(organization_accounts);

            //transforms it for inserting to database tb_transaction_entries
            transactionInstances.forEach( (transaction_entry : TransactionUIProp) => {
                const account_id = organization_accounts?.find((account)=>account.account_name===transaction_entry.account_name)?.uuid ?? "";
                
                if(!account_id){
                    alert(`The account ${transaction_entry.account_name} does not exist for some reason...`);
                    hasError = true;
                }

                transaction_entries.push({
                    account : account_id,
                    entry : transaction_entry.account_entry,
                    transaction_log_uuid : transaction_log_id,
                    amount : transaction_entry.account_amount
                });
            });

            if(hasError){
                deleteTransaction(transaction_log_id);
                alert(`An error has occured, cannot process further...`);
                
                return;
            }

            const { error : transaction_entry_error} = await supabase.from('tb_transaction_entries').insert(transaction_entries);

            if(transaction_entry_error){
                deleteTransaction(transaction_log_id);
                alert(transaction_entry_error.message);
                return;
            }

            clearTransactionDescription();
            setRefresh(prev=>prev+1);
        }

        const renderTransactions = () => {
            const removeTransaction = (index : number) => {
                setTransactionInstances( prev => [
                    ...prev.slice(0, index),
                    ...prev.slice(index + 1)  
                ]);
            }

            return transactionInstances?.map((instance : TransactionUIProp, index)=>{
                return (
                    <tr>
                        <td><p className='m-2'>{instance.account_name}</p></td>
                        <td><p className='m-2'>{(instance.account_entry === 'DEBIT' ?  'PHP ' + instance.account_amount.toFixed(2) : '-')}</p></td>
                        <td><p className='m-2'>{(instance.account_entry === 'CREDIT' ? 'PHP ' + instance.account_amount.toFixed(2) : '-')}</p></td>
                        <td><i className='m-2 bi bi-trash' style={{color: '#FF0000'}} onClick={(e)=>{removeTransaction(index)}}></i></td>
                    </tr>
                );
            });
        }

        const renderCalculatedTransactions = () => {
            let debitTotal : number = 0;
            let creditTotal : number = 0;

            transactionInstances?.map((instance : TransactionUIProp)=>{
                if(instance.account_entry === 'DEBIT'){
                    debitTotal += instance.account_amount;
                }else if(instance.account_entry === 'CREDIT'){
                    creditTotal += instance.account_amount;
                }
            });

            if(transactionInstances.length <= 0) return <></>;

            const isBalanced : boolean = transactionInstances.length > 1 && (Math.abs(debitTotal - creditTotal) <= 0.009);

            if(isBalanced !== balanced) setBalanced(isBalanced);

            return (
                <>
                    <tr className=''>
                        <td className='border-top-grey'><p className='m-2'>{(isBalanced) ? 'Balanced' : 'Not Balanced'}</p></td>
                        <td className='border-top-grey'><p className='m-2'>{(debitTotal === 0) ? '-' : 'PHP ' + debitTotal.toFixed(2)}</p></td>
                        <td className='border-top-grey'><p className='m-2'>{(creditTotal === 0) ? '-' : 'PHP ' + creditTotal.toFixed(2)}</p></td>
                        <td className='border-top-grey'></td>
                    </tr>
                </>
            );
        }

        return (<>
        
            <Modal
                display={openNewAccountModal}
                title='Add Entry'
                content={displayNewEntryModal()}
                cancelCallback={()=>{toggleNewEntryModal()}}
                confirmCallback={()=>{addNewEntry(); toggleNewEntryModal();}}
            />
            
            <div className="jcard jcard-large" style={{gridColumnStart:1, gridColumnEnd:4, gridRowStart:1, gridRowEnd:1}}>
                <div className="jcard-header d-flex flex-row justify-content-between align-items-center">
                    <h6>Create Journal Entry</h6>
                    <button className='btn btn-danger' onClick={(e)=>{toggleNewEntryModal()}}>Add Entry</button>
                </div>
                <div className="jcard-content my-5">
                    <table className='w-100 my-5 py-5'>
                        <thead>
                            <tr>
                                <th>Account Name</th>
                                <th>Debit</th>
                                <th>Credit</th>
                            
                            </tr>
                        </thead>
                        <tbody>
                            {renderTransactions()}
                            {renderCalculatedTransactions()}
                        </tbody>
                        
                    </table>
                    
                    <Input id='_journal_entry_transaction_input' label='Transaction Description' className='w-100' type='text' valueRef={transactionDescriptionRef}/>
                    
                </div>

                <div className="d-flex w-100 justify-content-end">
                    <button className={'btn btn-secondary ' + (balanced ? '' : ' disabled')} onClick={()=>{createTransaction()}}>Create Transaction</button>
                </div>
            </div>
        </>)
    }

    export default JournalEntryComponent;