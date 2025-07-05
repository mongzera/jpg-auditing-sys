import { useEffect, useRef, useState } from "react";
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
    or_number : number,
    payment_method_account_name : string
    date_paid : string
}

interface MemberCollectionInstance{
    member_uuid : string, //tb_organization_member->id
    payment_method : string, //account_uuid
    transaction_receipt : string
}

function RecordCollection(props : any){
    const {refresh, setRefresh} = props;

    const collectionNameRef = useRef<string>("");
    const memberNameRef = useRef<string>("");
    const paymentMethodRef = useRef<string>("");

    const [currentOrganizationCollections, setCurrentOrganizationCollections] = useState<OrganizationCollections[] | undefined>();
    const [membersToBeCollected, setMembersToBeCollected] = useState<MembersToBeCollected[]>([]);
    const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
    const [organizationAccounts, setOrganizationAccounts] = useState<OrganizationAccount[] | undefined>();

    const addMemberToBeCollected = () => {
        let newMember : MembersToBeCollected = {
            
            name: memberNameRef.current,
            or_number: membersToBeCollected!.length,
            date_paid: "2025-6-3",
            payment_method_account_name : 'Cash'
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
                    return (
                        <tr>
                            <td><h6>{member.name}</h6></td>
                            <td><span className="d-flex flex-row align-items-center"><h6>OR No.</h6><input style={{maxWidth: '60px'}} type='text' defaultValue={member.or_number} /></span></td>
                            <td><Select label={""} choices={organizationAccounts?.map((account)=>account.account_name)} valueRef={paymentMethodRef}/></td>
                            <td><h6 style={{textAlign: 'center'}}>{member.date_paid}</h6></td>
                            <td><i className="bi bi-trash" style={{color: '#FF0000'}} onClick={()=>{deleteMember(member)}}></i></td>
                        </tr>
                    );
                })}
            </>
        );
    }

    const submitBatchPayments = async (paymentsArray : MemberCollectionInstance[]) => {
        let org_uuid = getUserOrgData()!.organization_id;
        let collectionUUID = currentOrganizationCollections?.find((collection)=>collection.collection_name === collectionNameRef.current)?.id

        
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

        membersToBeCollected.map( (collectedMember) => {
            let member_uuid = currentMembers.find((member)=> collectedMember.name === (`${member.last_name}, ${member.first_name} ${member.middle_initial}.`))!.id;

            if(!member_uuid){
                alert(`Error: System Glitch [User cannot be found ${collectedMember.name}]`);
                return;

            }

            let collectionInstance : MemberCollectionInstance = {
                member_uuid: member_uuid,
                payment_method: organizationAccounts!.find((account) => account.account_name === collectedMember.payment_method_account_name)!.uuid,
                transaction_receipt: `OR No. ${collectedMember.or_number}`
            }

            membersForCollection.push(collectionInstance);
        });

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
                        <Select label={'Record for collection: '} choices={currentOrganizationCollections?.map((collection)=>collection.collection_name)} valueRef={collectionNameRef}/>
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