import { useEffect, useState } from 'react';
import Select from '../../../widgets/Select';
import type { Member } from '../organization_settings/OrganizationSettings';
import './Collections.css'
import MemberCollectionStatus, { type MemberCollectionProp } from './MemberCollectionStatus';
import RecordCollection from './RecordCollection';
import { fetchCollections, fetchMemberCollectionStatus, fetchOrganizationMembers } from '../../../utils/organization-utils';
import CreateCollection from './CreateCollection';

export interface MemberCollectionPaymentStatus{
    id : string,
    member_uuid : string,
    collection_uuid : string,
    payment_method : string,
    transaction_receipt : string
}

export interface OrganizationCollections{
    id : string,
    account_uuid : string,
    collection_amount : number,
    collection_name : string,
    collection_description : string,
}

function Collections(){

    const [currentMembers, setCurrentMembers] = useState<Member[] | undefined>([]);
    const [memberCollectionPaymentStatus, setMemberCollectionPaymentStatus] = useState<MemberCollectionPaymentStatus[] | undefined>([]);
    const [organizationCollections, setOrganizationCollections] = useState<OrganizationCollections[] | undefined>();
    const [refresh, setRefresh] = useState(0);

    const collectionNames = () => {
        return organizationCollections?.map((item)=>{
    
            return <th  style={{minWidth: '200px', textAlign: 'center'}}><h6>{item.collection_name}</h6></th>
        });
    }

    useEffect( ()=> {
        const fetchAll = async()=>{
            let members = await fetchOrganizationMembers();
            let collections = await fetchCollections();
            let memberCollectionPaymentStat = await fetchMemberCollectionStatus();

            setCurrentMembers( members?.map( (member)=> member as Member))
            setMemberCollectionPaymentStatus( memberCollectionPaymentStat?.map((stat)=> stat as MemberCollectionPaymentStatus));
            setOrganizationCollections(collections?.map((collection)=>collection as OrganizationCollections));
        }

        fetchAll();
    }, [refresh]);

    return (
        <>
            <div className="jgrid">
                <RecordCollection refresh={refresh} setRefresh={setRefresh}/>

                <CreateCollection refresh={refresh} setRefresh={setRefresh}/>

                <div className="jcard slider" style={{gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 2, gridRowEnd: 2}}>
                    <table className='jtable w-100 mx-3'>
                        <thead>
                            <tr>
                                <th style={{minWidth: '300px'}}><h6>Name</h6></th>
                                {collectionNames()}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentMembers?.map( (member, index) => {
                                    return <MemberCollectionStatus darken={(index % 2 === 0)} name={`${member.last_name}, ${member.first_name} ${member.middle_initial}.`} collections={organizationCollections} collection_status={memberCollectionPaymentStatus?.filter((status)=>status.member_uuid === member.id)}/>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            
        </>
    );
}

export default Collections;