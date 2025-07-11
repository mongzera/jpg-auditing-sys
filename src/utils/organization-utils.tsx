import type { MemberCollectionPaymentStatus, OrganizationCollections } from "../dashboard/views/collections/Collections";
import { supabase } from "../supabase";
import { getUserOrgData } from "./user-util";

const GENERAL_ACCOUNTS = 'general_accounts';
const ORGANIZATION_ACCOUNTS = 'organization_accounts';

export interface TransactionEntry{
    id : string, //transaction entry uuid
    account : string, //uuid of organization account
    account_type : string, //name of general account account => determined on fetching
    entry : string, //entry of transaction DEBIT | CREDIT
    amount : number, //amount in php
    account_name : string, // organization account name
    account_normal_balance : string,
    member_paid : string,
    or_number : string,
    payment_transaction : {
        member_uuid : string,
        transaction_receipt : string
    }
}

export interface TransactionLog{
    id : string,
    description : string,
    amount : number,
    created_at : string,
    entries : TransactionEntry[]
    
}

export interface GeneralAccounts{
    id : number,
    account_name : string,
    account_normal_balance : 'DEBIT' | 'CREDIT'
}

export interface OrganizationAccount{
    uuid : string,
    account_name : string,
    account_type : string,
    account_normal_balance : 'DEBIT' | 'CREDIT'
}

export const fetchOrganizationTransactions = async () => {
    const {data, error} = await supabase.from('tb_transaction_log').select('*, entries:tb_transaction_entries(*, payment_transaction:tb_paid_members (*))').eq('organization_uuid', getUserOrgData()?.organization_id);
    
    const members = await fetchOrganizationMembers();

    if(error){
        console.log(error.message);
        return;
    }

    const orgChartOfAccounts = getOrganizationAccounts();

    //console.log(data);
    const formattedTransactionLogs = data.map((item)=>{
        const formattedItem = item as TransactionLog

        let creditBalance = 0;
        let debitBalance = 0;

        formattedItem.entries.forEach((transact_entry)=>{
            const org_account = orgChartOfAccounts?.find(item=>item.uuid === transact_entry.account);

            const isACollectionFromMember = !!transact_entry?.payment_transaction;
            let memberName = '';
            let orNumber = '';

            if(isACollectionFromMember){
                let mem = members!.find((member)=>member.id === transact_entry!.payment_transaction.member_uuid)
                orNumber = transact_entry!.payment_transaction.transaction_receipt;
                memberName = `${mem.last_name}, ${mem.first_name} ${mem.middle_initial}.`
            }
        
            transact_entry.account_name = org_account!.account_name;
            transact_entry.account_type = org_account!.account_type;
            transact_entry.account_normal_balance = org_account!.account_normal_balance;
            transact_entry.member_paid = memberName;
            transact_entry.or_number = orNumber;
            (transact_entry.entry === 'DEBIT') ? debitBalance += transact_entry.amount : creditBalance += transact_entry.amount;

        });

        //set the amount if they are balanced, otherwise set it as the difference...
        formattedItem.amount = (creditBalance === debitBalance) ? debitBalance : Math.abs(debitBalance - creditBalance);

        return formattedItem;
    });

    return formattedTransactionLogs as TransactionLog[];
}

export const fetchOrganizationAccountsTypes = async () =>{
    const {data : general_accounts, error : general_accounts_error} = await supabase.from('tb_general_account').select('*');

    if(general_accounts_error){
        console.error(general_accounts_error.message);
        return;
    }

    sessionStorage.setItem(GENERAL_ACCOUNTS, JSON.stringify(general_accounts));

    const {data : organization_accounts, error : organization_accounts_error} = await supabase.from('tb_organization_account').select('*, general_account: tb_general_account (account_normal_balance) ').eq('organization_id', getUserOrgData()!.organization_id);

    if(organization_accounts_error){
        console.error(organization_accounts_error.message);
        return;
    }

    const formattedOrganizationAccounts : OrganizationAccount[] = organization_accounts.map( (e)=>{
        let account = {
            uuid : e.id,
            account_name : e.account_name,
            account_type : general_accounts.find((f)=>f.id === e.account_type).account_name,
            account_normal_balance : e.general_account.account_normal_balance
        };
        
        return account;
    });

    sessionStorage.setItem(ORGANIZATION_ACCOUNTS, JSON.stringify(formattedOrganizationAccounts));

    console.log(organization_accounts);
}

export const fetchOrganizationMembers = async() => {
    const org_uuid = await getUserOrgData()?.organization_id;
    const {data : members, error} = await supabase.from('tb_organization_members').select('*').eq('organization_uuid', org_uuid);

    if(error){
        console.error(error.message);
        return;
    }

    return members;
}

export const fetchCollections = async () => {
    const org_uuid = await getUserOrgData()?.organization_id;
    const { data : collections, error } = await supabase.rpc('get_collections_by_org', { organization_uuid: org_uuid});
    if(error){
        console.error(error.message);
        return;
    }

    console.log(collections);

    return collections as OrganizationCollections[];
}

export const fetchMemberCollectionStatus = async () => {
    const org_uuid = await getUserOrgData()?.organization_id;

    const { data : collection_status, error } = await supabase.rpc('get_paid_members', { organization_uuid: org_uuid});

    if(error){
        console.error(error.message);
        return;
    }

    return collection_status as MemberCollectionPaymentStatus[];
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

    return organization_account ?? undefined;
}


