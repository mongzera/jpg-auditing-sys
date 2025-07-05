import { useEffect, useRef, useState } from "react";
import Select from "../../../widgets/Select";
import Input from "../../../widgets/Input";
import { fetchOrganizationAccountsTypes as fetchOrganizationAccounts, getOrganizationAccounts, type OrganizationAccount } from "../../../utils/organization-utils";
import { supabase } from "../../../supabase";

interface CreateCollectionProps{
    refresh : number,
    setRefresh : Function
}

function CreateCollection(props : CreateCollectionProps){

    const {refresh, setRefresh} = props;

    const accountRef = useRef<string>('');
    const collectionNameRef = useRef<HTMLInputElement>(null);
    const collectionDescriptionRef = useRef<HTMLInputElement>(null);
    const collectionAmountRef = useRef<HTMLInputElement>(null);
    const [organizationAccounts, setOrganizationAccounts] = useState<OrganizationAccount[] | null>([]);

    const createCollection = async () => {
        setRefresh((prev:number)=>prev+1);

        if(!accountRef.current){
            alert("Selected account is invalid!");
            return;
        }

        const nameRegex = /^[a-zA-Z0-9 _-]{3,50}$/;
        const descRegex = /^[\w\s.,'"!?()\-]{3,255}$/;
        const amountRegex = /^\d+(\.\d{1,2})?$/;


        const collectionName = collectionNameRef.current?.value ?? '';
        const collectionDesc = collectionDescriptionRef.current?.value ?? '';
        const collectionAmount = collectionAmountRef.current?.value ?? '';

        //clear values
        if(!!collectionNameRef.current) collectionNameRef.current.value = '';
        if(!!collectionDescriptionRef.current) collectionDescriptionRef.current.value = '';
        if(!!collectionAmountRef.current) collectionAmountRef.current.value = '';

        if (!nameRegex.test(collectionName)) {
            alert("Invalid collection name.\nLetter count bounds [3-50]\nOnly characters[a-z A-Z 0-9] are allowed");
            return;
        }
        if (!descRegex.test(collectionDesc)) {
            alert("Invalid description.\nLetter count bounds [3-255]");
            return;
        }
        if (!amountRegex.test(collectionAmount)) {
            alert("Invalid amount.\nNegative amount is not allowed\nUp to two (2) decimal places only");
            return;
        }

        //insert
        const {error} = await supabase.from('tb_collections').insert( {
            account_uuid : organizationAccounts?.find((account)=>account.account_name === accountRef.current)?.uuid,
            collection_name : collectionName,
            collection_description : collectionDesc,
            collection_amount : collectionAmount
        } );

        if(error){
            console.log(error.message);
            return;
        }

        
    }

    useEffect( ()=>{
        const fetchAll = async () => {
            const orgAccounts = await getOrganizationAccounts();

            setOrganizationAccounts(orgAccounts);
        }

        fetchAll();
    }, [refresh]);

    return (
        <>
            <div className="jcard" style={{gridColumnStart: 2, gridColumnEnd: 4, gridRowStart: 1, gridRowEnd: 1}}>
                <div className="jcard-header d-flex flex-row justify-content-between align-items-center  h-25">
                    <h6>Create New Collection</h6>
                    <Select label={"Set Account"} choices={organizationAccounts?.map((account)=>account.account_name)} valueRef={accountRef}/>
                </div>
                <div className="jcard-content h-75">
                    <div className="d-flex h-75 flex-column justify-content-around">
                        <div className="section1 d-flex flex-row justify-content-between ">
                            <Input label={"Collection Name"} type={"text"} inputRef={collectionNameRef} className={"w-50 px-2"} id={""} />
                            <Input label={"Collection Amount"} type={"text"} inputRef={collectionAmountRef} className={"w-50 px-2"} id={""} />
                        </div>
                        <Input label={"Collection Description"} type={"text"} inputRef={collectionDescriptionRef} className={"px-2 "} id={""} />
                    </div>
                    <div className="section3 d-flex flex-row justify-content-end align-items-end h-25">
                        <button className="btn btn-danger" onClick={()=>{createCollection()}}>Create Collection</button>
                    </div>
                </div>
            </div>
        </>

    );

}

export default CreateCollection;