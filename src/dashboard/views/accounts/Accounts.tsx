import { useEffect, useRef, useState } from 'react';
import './Accounts.css'
import Modal from '../../../widgets/Modal';
import AuthInput from '../../../auth/AuthInput';
import Input from '../../../widgets/Input';
import Select from '../../../widgets/Select';
import { supabase } from '../../../supabase';
import { getUserOrgData } from '../../../utils/user-util';
import { fetchOrganizationAccountsTypes, getGeneralAccounts, getOrganizationAccounts, type GeneralAccounts, type OrganizationAccount } from '../../../utils/organization-utils';

//in this case -> OrganizationAccount = Chart of Accounts

function Accounts(){
    const newAccountNameRef = useRef<string>("");
    const newAccountTypeRef = useRef<string>("");

    const [displayNewOrgAccountModal, setDisplayNewOrgAccountModal] = useState<boolean>(false)
    const [organizationAccounts, setOrganizationAccounts] = useState<OrganizationAccount[] | null>([]);
    const [accountTypes, setAccountTypes] = useState<GeneralAccounts[] | null>([]);
    const [accountTypeNames, setAccountTypeNames] = useState<string[] | null>([]);
    const [reload, setReload] = useState(0);

    const generalAccounts = () => {
        return accountTypes?.map( (item)=> {
            return (
                <tr>
                    <td>{item.account_name}</td>
                    <td style={{textAlign:'left'}}>{item.account_entry}</td>
                    <td>PHP {(Math.random() * 10000 + 4000).toFixed(2)}</td>
                </tr>
            )
            
        });
    }

    const renderOrganizationAccounts = () => {
        

        const accounts = organizationAccounts;

        return accounts?.map( (item)=> {
            return (
                <tr>
                    <td>{item.account_name}</td>
                    <td>{item.account_type}</td>
                    <td>{item.account_entry}</td>
                    <td>PHP {((Math.random() * 5000 + 5000).toFixed(2))}</td>
                </tr>
            )
            
        });
    }

    const createOrganizationAccount = async () => {
        if(!accountTypes) {
            alert("Error has occured creating account");
            return;
        }

        console.log('creating: ' + newAccountNameRef.current, newAccountTypeRef.current);
        const accountName = newAccountNameRef.current.trim();
        const accountType = newAccountTypeRef.current.trim();

        if(accountName.length < 3){
            alert("Account name must atleast have 3 letters!")
            return;
        }

        if(accountType.length < 3){
            alert("Account type is invalid!");
            return;
        }

        const payloadAccountType = accountTypes.find( (item) => item.account_name === accountType)?.id;

        if(!payloadAccountType){
            alert("Account type is invalid!");
            return;
        }

        const payload = 
        {
            account_name : accountName,
            account_type : payloadAccountType,
            organization_id : getUserOrgData()!.organization_id
        };

        

        const { error} = await supabase.from('tb_organization_account').insert(payload);
            
        if(error) alert(error.message);
    }

    const fetchAccounts = async () => {
        await fetchOrganizationAccountsTypes();

        const generalAccounts = getGeneralAccounts();

        setAccountTypes(generalAccounts);
        setAccountTypeNames(generalAccounts?.map( (item) => item.account_name) ?? []);

        const organizationAccounts = getOrganizationAccounts();
        
        setOrganizationAccounts( organizationAccounts );
    }

    useEffect( ()=> {
        fetchAccounts();
    }, [reload]);

    return (
        <>
            <Modal 
            display={displayNewOrgAccountModal}
            title='Create New Organization Account'
            cancelCallback={()=>{setDisplayNewOrgAccountModal(false)}}
            confirmCallback={()=>{setDisplayNewOrgAccountModal(false); createOrganizationAccount(); setReload(prev=>prev+1)}}
            content={
            <>
                <div className="d-flex flex-row align-items-center justify-content-around p-3">
                    <div className="m-3"><Input id='account_name_input' className={'jinput-200'} label='Account Name' type='text' valueRef={newAccountNameRef}/></div>
                    <div className="m-3"><Select label='Account Type' valueRef={newAccountTypeRef} choices={accountTypeNames??[]} /></div>
                </div>
            </>
            }/>
     
            <div className="jgrid">
                <div className="jcard jcard-large p-4" style={{gridColumnStart:1, gridColumnEnd:4, gridRowStart:1, gridRowEnd:1}}>
                    <div className="jcard-header">
                        <h6>General Accounts</h6>
                    </div>
                    <div className="jcard-content">
                        <table className='jtable'>
                            <thead>
                                <tr>
                                    <th><h6>Account Name</h6></th>
                                    <th><h6 style={{textAlign:'left'}}>Normal Balance</h6></th>
                                    <th><h6>Balance</h6></th>
                                </tr>
                            </thead>
                            <tbody>
                                {generalAccounts()}
                            </tbody>
                        </table>
                    </div>
                </div>
                 
                <div className="jcard jcard-large p-4" style={{gridColumnStart:1, gridColumnEnd:4, gridRowStart:2, gridRowEnd:2}}>
                    <div className="jcard-header d-flex flex-row justify-content-between align-items-center py-4">
                        <h6>Chart of Accounts</h6>
                        <button className='btn btn-secondary' onClick={()=>{newAccountNameRef.current = ""; newAccountTypeRef.current = ""; setDisplayNewOrgAccountModal(true)}}>Create Account</button>
                    </div>
                    <div className="jcard-content">
                        <table className='jtable'>
                            <thead>
                                <tr>
                                    <th><h6>Account Name</h6></th>
                                    <th><h6>Type of Account</h6></th>
                                    <th><h6  style={{textAlign:'left'}}>Normal Balance</h6></th>
                                    <th><h6>Balance</h6></th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderOrganizationAccounts()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
        </>
    );
}

export default Accounts;