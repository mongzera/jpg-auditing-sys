import { supabase } from "../supabase";
import { getUserOrgData } from "./user-util";

const GENERAL_ACCOUNTS = 'general_accounts';
const ORGANIZATION_ACCOUNTS = 'organization_accounts';

export interface GeneralAccounts{
    id : number,
    account_name : string,
    account_entry : 'DEBIT' | 'CREDIT'
}

export interface OrganizationAccount{
    uuid : string,
    account_name : string,
    account_type : string,
    account_entry : 'DEBIT' | 'CREDIT'
}

export const fetchOrganizationAccountsTypes = async () =>{
    const {data : general_accounts, error : general_accounts_error} = await supabase.from('tb_general_account').select('*');

    if(general_accounts_error){
        console.error(general_accounts_error.message);
        return;
    }

    sessionStorage.setItem(GENERAL_ACCOUNTS, JSON.stringify(general_accounts));

    const {data : organization_accounts, error : organization_accounts_error} = await supabase.from('tb_organization_account').select('*, general_account: tb_general_account (account_entry) ').eq('organization_id', getUserOrgData()!.organization_id);

    if(organization_accounts_error){
        console.error(organization_accounts_error.message);
        return;
    }

    const formattedOrganizationAccounts = organization_accounts.map( (e)=>{
        let account = {
            uuid : e.id,
            account_name : e.account_name,
            account_type : general_accounts.find((f)=>f.id === e.account_type).account_name,
            account_entry : e.general_account.account_entry
        };
        
        return account;
    });

    sessionStorage.setItem(ORGANIZATION_ACCOUNTS, JSON.stringify(formattedOrganizationAccounts));

    console.log(organization_accounts);
}

export const getGeneralAccounts = () => {
    if(!sessionStorage.getItem(GENERAL_ACCOUNTS)) return null;


    let general_accounts_json = JSON.parse(sessionStorage.getItem(GENERAL_ACCOUNTS)!);

    let general_account : GeneralAccounts[] = general_accounts_json.map( (item : any)=>{
        return item as GeneralAccounts;
    } );

    return general_account;
}

export const getOrganizationAccounts = () => {

    if(!sessionStorage.getItem(ORGANIZATION_ACCOUNTS)) return null;

    let organization_accounts_json = JSON.parse(sessionStorage.getItem(ORGANIZATION_ACCOUNTS)!);

    let organization_account : OrganizationAccount[] = organization_accounts_json.map( (item : any)=>{
        return item as OrganizationAccount;
    } );

    return organization_account;
}


