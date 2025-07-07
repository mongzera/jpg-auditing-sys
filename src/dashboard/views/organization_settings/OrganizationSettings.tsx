import { useEffect, useRef, useState } from 'react';
import Input from '../../../widgets/Input';
import './OrganizationSettings.css'
import { supabase } from '../../../supabase';
import { getUserOrgData } from '../../../utils/user-util';
import { fetchOrganizationMembers } from '../../../utils/organization-utils';

export interface Member{
    id : string,
    first_name : string,
    last_name : string,
    middle_initial : string,
    created_at : string
}

function OrganizationSettings(){

    const fnRef = useRef<HTMLInputElement>(null);
    const lnRef = useRef<HTMLInputElement>(null);
    const miRef = useRef<HTMLInputElement>(null);
    const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
    const [refresh, setRefresh] = useState<number>(0);

    const addMember = async() => {
        //validate input
        let memberLastName = fnRef.current?.value.trim() ?? '';
        let memberFirstName = lnRef.current?.value.trim() ?? '';
        let memberMiddleInitial = miRef.current?.value.trim() ?? '';



        fnRef.current?.focus();

        if(memberLastName.length < 2){
            alert('Last name must have at least 2 letters!');
            return;
        }

        if(memberFirstName.length < 2){
            alert('First name must have at least 2 letters!');
            return;
        }

        if(memberMiddleInitial.length < 1){
            alert('Middle Initial must have at least 1 letters!');
            return;
        }

        if(memberMiddleInitial.length > 2){
            alert('Middle Initial must have at most 2 letters!');
            return;
        }

        const org_uuid = await getUserOrgData()!.organization_id;

        const {data: existingMember, error: existingMemberErr} = await supabase.from('tb_organization_members').select('*').eq('organization_uuid', org_uuid);
        
        console.log(existingMember);
        if(existingMemberErr){
            console.log(existingMemberErr.message);
            alert('Cannot add member for some reason...');
            return;
        }

        let memberExists = false;
        console.log(memberFirstName)

        existingMember.forEach((item : Member)=>{
            let fn_match = item.first_name === memberFirstName;
            let ln_match = item.last_name === memberLastName;
            let mi_match = item.middle_initial === memberMiddleInitial;

            if(fn_match && ln_match && mi_match) memberExists = true;
        });

        console.log('member exists', memberExists)

        if(memberExists){
            alert("That member already exists!");
            return;
        }

        const {error} = await supabase.from('tb_organization_members').insert({
            first_name : memberFirstName,
            last_name : memberLastName,
            middle_initial : memberMiddleInitial,
            organization_uuid : org_uuid
        });

        memberFirstName = "";
        memberLastName = "";
        memberMiddleInitial = "";
        
        if(!!fnRef.current) fnRef.current.value = memberFirstName;
        if(!!lnRef.current) lnRef.current.value = memberLastName;
        if(!!miRef.current) miRef.current.value = memberMiddleInitial;

        

        if(error){
            alert(error.message);
            return;
        }

        setRefresh(prev=>prev+1);
    }

    useEffect(()=>{

        const enterHandler = (e : KeyboardEvent) => {
            if(e.key === 'Enter') addMember();
        }

        document.addEventListener('keydown', enterHandler);

        //request members
        const fetchAll = async() => {
            const members = await fetchOrganizationMembers();

            if(!!members){
                setCurrentMembers(members.map((m)=>m as Member));
            }
        }

        fetchAll();

        return ()=>{document.removeEventListener('keydown', enterHandler)}

        
    }, [refresh]);

    return (
        <>
            <div className="jgrid">
                <div className="jcard add-member" style={{gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 1}}>
                    <div className="jcard-header">
                        <h6>Add Member</h6>
                        <div className="add-member d-flex flex-row w-100 justify-content-between">
                            <Input inputRef={fnRef} label={'Last Name'} type={'text'} className={'w-25'} id={''}/>
                            <Input inputRef={lnRef} label={'First Name'} type={'text'} className={'w-25'} id={''}/>
                            <Input inputRef={miRef} label={'M.I'} type={'text'} className={'w-25'} id={''}/>
                            <button className="btn btn-danger" onClick={()=>{addMember()}}>Add Member</button>
                        </div>
                    </div>
                    <div className="jcard-content">
                            
                    </div>
                </div>
                <div className="jcard member-list" style={{gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 2}}>
                    
                    <div className="jcard-header" style={{borderBottom: '1px solid grey'}}>
                        <p>Organization Members</p>
                    </div>
                    <div className="jcard-content">
                        <table className='w-100'>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentMembers.map((member)=>{
                                    return <tr>
                                        <td className="name">
                                            <p>{member.last_name}, {member.first_name} {member.middle_initial}.</p>
                                        </td>
                                        <td className="date-added">
                                            <p>{member.created_at.split("T")[0]}</p>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrganizationSettings;