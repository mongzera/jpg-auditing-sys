import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Select from "../../../widgets/Select";
import Input from "../../../widgets/Input";
import SearchBar from "../../../widgets/SearchBar";
import type { Member } from "../organization_settings/OrganizationSettings";
import { fetchCollections, fetchOrganizationMembers, getOrganizationAccounts, type OrganizationAccount } from "../../../utils/organization-utils";
import { supabase } from "../../../supabase";
import type { OrganizationCollections } from "./Collections";
import { getUserOrgData } from "../../../utils/user-util";

interface MembersToBeCollected{
    name : string,
}

interface MemberCollectionInstance{
    member_uuid : string, //tb_organization_member->id
    payment_method : string, //account_uuid
    transaction_receipt : string
}

function RecordCollection(props : any){
    const {refresh, setRefresh} = props;

    const collectionNameSelectRef = useRef<HTMLSelectElement>(null);
    const memberNameRef = useRef<string>("");

    const [currentOrganizationCollections, setCurrentOrganizationCollections] = useState<OrganizationCollections[] | undefined>();
    const [membersToBeCollected, setMembersToBeCollected] = useState<MembersToBeCollected[]>([]);
    const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
    const [organizationAccounts, setOrganizationAccounts] = useState<OrganizationAccount[] | undefined>();

    const addMemberToBeCollected = () => {
        let newMember : MembersToBeCollected = {
            name: memberNameRef.current,
        }

        //clear search bar
        memberNameRef.current = "";
        (document.getElementById('member_name_input') as HTMLInputElement).value = memberNameRef.current;

        //check if this member has been added already
        if(!!membersToBeCollected.find((item)=>item.name === newMember.name)){
            alert("This member has been added already!");
            return;
        }

        //check if this member really exists
        if(!currentMembers.find((member)=>(`${member.last_name}, ${member.first_name} ${member.middle_initial}.`) === newMember.name)){
            return;
        }

        setMembersToBeCollected(prev => [...prev, newMember])
    }

    const deleteMember = (member : MembersToBeCollected) => {
        setMembersToBeCollected(prev=>prev.filter((e)=>e.name!==member.name));
    }



    const displayInputtedMembers = () => {

        return (
            <>
                {membersToBeCollected?.map((member)=>{

                    // const paymentMethodRef = useRef<HTMLSelectElement>(null)
        
                    // useEffect( ()=>{
                    //     const handleValueChange = (e : ChangeEvent) =>{
                    //         console.log((e.target as HTMLSelectElement).value)
                    //     }

                    //     paymentMethodRef.current?.addEventListener('change', (e) => handleValueChange);

                    //     return ()=>{paymentMethodRef.current?.removeEventListener('change', (e) => handleValueChange);}
                    // }, []);

                    //TODO: Fix this issue...
                    /**
                     * Use MembersToBeCollectedInterface for this problem
                     * I need to set these inputs below such as paymentMethod.
                     * Each user will have varying payment methods and OR.Nos ...
                     */


                    return (
                        <tr>
                            <td><h6>{member.name}</h6></td>
                            <td><span className="d-flex flex-row align-items-center"><h6>OR No.</h6><input style={{maxWidth: '60px'}} type='text' id={member.name + '-or-number'} /></span></td>
                            <td><Select id={member.name + '-payment-method'} label={""} choices={organizationAccounts?.map((account)=>account.account_name)}/></td>
                            <td><input type="date" name="" id={member.name + '-date-paid'} /></td>
                            <td><i className="bi bi-trash" style={{color: '#FF0000'}} onClick={()=>{deleteMember(member)}}></i></td>
                        </tr>
                    );
                })}
            </>
        );
    }

    const submitBatchPayments = async (paymentsArray : MemberCollectionInstance[]) => {
        
        //this one is faulty...
        console.log('COL NAME REF: ' + collectionNameSelectRef.current);
        let collectionUUID = currentOrganizationCollections?.find((collection)=>collection.collection_name === collectionNameSelectRef.current?.value)?.id ?? ''

        if(!collectionUUID){
            alert('Collection is invalid for some reason...');
            return;
        }
        
        const { data, error } = await supabase.rpc('submit_collection_payments', {
            _collection_uuid: collectionUUID,
            _payments: paymentsArray
        });

        if (error) {
            console.error('Failed to record payments:', error);
            alert('Failed to record payments.');
        } else {
            console.log('Batch payments recorded:', data);
            setRefresh((prev : number)=>prev+1);
        }
    }

    const submitCollection = () => {
        let membersForCollection : MemberCollectionInstance[] = [];

        let failed = false;

        membersToBeCollected.map( (collectedMember) => {
            if(failed) return;

            let member_uuid = currentMembers.find((member)=> collectedMember.name === (`${member.last_name}, ${member.first_name} ${member.middle_initial}.`))!.id;
            const or_number = (document.getElementById(collectedMember.name + '-or-number') as HTMLInputElement).value;
            const date_paid = (document.getElementById(collectedMember.name + '-date-paid') as HTMLInputElement).value;
            const payment_method = (document.getElementById(collectedMember.name + '-payment-method') as HTMLInputElement).value;

            //validate
            if(!or_number){
                //must be a number
                failed = true;
                alert(`OR No. for ${collectedMember.name} is invalid!`);
                return;
            }

            if(!date_paid){
                failed = true;
                alert(`Payment Date specified for ${collectedMember.name} is invalid!`);
                return;
            }

            if(!payment_method){
                failed = true;
                alert(`Payment Method for ${collectedMember.name} is invalid!`);
                return;
            }


            if(!member_uuid){
                alert(`Error: System Glitch [User cannot be found ${collectedMember.name}]`);
                return;

            }

            let collectionInstance : MemberCollectionInstance = {
                member_uuid: member_uuid,
                payment_method: organizationAccounts!.find((account) => account.account_name === payment_method)!.uuid,
                transaction_receipt: `OR No. ${or_number}`
            }

            membersForCollection.push(collectionInstance);
        });

        //clear inputs
        if(failed) return;

        setMembersToBeCollected([]);

        submitBatchPayments(membersForCollection);
        
    }

    useEffect( ()=>{
        //request members
        const fetchAll = async() => {
            const members = await fetchOrganizationMembers();
            const orgAccounts = await getOrganizationAccounts();

            const collections = await fetchCollections();

            setOrganizationAccounts(orgAccounts as OrganizationAccount[]);
            setCurrentOrganizationCollections(collections as OrganizationCollections[]);

            if(!!members){
                setCurrentMembers(members.map((m)=>m as Member));
            }
        }

        fetchAll();
    }, [refresh]);

    return (
        <>
            <div className="jcard" style={{gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 1}}>
                <div className="jcard-header my-2">
                    
                    <div className="d-flex justify-content-between align-items-center">
                        <h6>Record Collections</h6>
                        <Select label={'Record for collection: '} choices={currentOrganizationCollections?.map((collection)=>collection.collection_name)} selectRef={collectionNameSelectRef}/>
                    </div>
                </div>
                <div className="jcard-content">
                    <div className="search-bar d-flex flex-row align-items-end justify-content-between">
                        <SearchBar label={"Search Member: "} type={"text"} valueRef={memberNameRef} className={""} id={"member_name_input"} array={currentMembers.map((member : Member)=> (`${member.last_name}, ${member.first_name} ${member.middle_initial}.`))} />
                        <button className="btn btn-primary h-50 w-25" onClick={()=>{addMemberToBeCollected()}}>Add Member</button>
                    </div>   
                    <br />
                    <div className="inputted-members">
                        <table className="jtable new-collection-table">
                            <thead style={{borderBottom: '0.5px solid grey'}}>
                                <tr>
                                    <th>
                                        <h6>Member Name</h6>
                                    </th>
                                    <th>
                                        <h6>OR No.</h6>
                                    </th>
                                    <th>
                                        <h6>Payment Method</h6>
                                    </th>
                                    <th>
                                        <h6 style={{textAlign: 'center'}}>Date</h6>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <br ></br>
                                {displayInputtedMembers()}
                            </tbody>
                        </table>
                        <div className="submit w-100 d-flex justify-content-end mt-5">
                            <button className="btn btn-danger" onClick={()=>{submitCollection()}}>Submit Collection</button>
                        </div>
                        <div className="submit w-100 d-flex justify-content-end mt-5">
                            <button className="btn btn-danger" onClick={()=>{submitCollection()}}>Submit Collection</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RecordCollection;