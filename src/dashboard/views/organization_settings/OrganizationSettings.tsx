import { useEffect, useRef, useState } from 'react';
import './OrganizationSettings.css'
import { fetchOrganizationMembers } from '../../../utils/organization-utils';
import { getUserOrgData } from '../../../utils/user-util';
import { supabase } from '../../../supabase';

export interface Member{
    id : string,
    first_name : string,
    last_name : string,
    middle_initial : string,
    created_at : string
}

function OrganizationSettings(){
    const memberLastName = useRef<string>("");
    const memberFirstName = useRef<string>("");
    const memberMiddleInitial = useRef<string>("");
    const fnRef = useRef<HTMLInputElement>(null);
    const lnRef = useRef<HTMLInputElement>(null);
    const miRef = useRef<HTMLInputElement>(null);
    const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
    const [refresh, setRefresh] = useState<number>(0);

    const addMember = async() => {
        //validate input
        memberLastName.current = memberLastName.current.trim();
        memberFirstName.current = memberFirstName.current.trim();
        memberMiddleInitial.current = memberMiddleInitial.current.trim();

        fnRef.current?.focus();

        if(memberLastName.current.length < 2){
            alert('Last name must have at least 2 letters!');
            return;
        }

        if(memberFirstName.current.length < 2){
            alert('First name must have at least 2 letters!');
            return;
        }

        if(memberMiddleInitial.current.length < 1){
            alert('Last name must have at least 1 letters!');
            return;
        }

        if(memberMiddleInitial.current.length > 2){
            alert('Last name must have at most 2 letters!');
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
        console.log(memberFirstName.current)
        existingMember.forEach((item : Member)=>{
            let fn_match = item.first_name === memberFirstName.current;
            let ln_match = item.last_name === memberLastName.current;
            let mi_match = item.middle_initial === memberMiddleInitial.current;

            if(fn_match && ln_match && mi_match) memberExists = true;
        });
        console.log('member exists', memberExists)
        if(memberExists){
            alert("That member already exists!");
            return;
        }

        const {error} = await supabase.from('tb_organization_members').insert({
            first_name : memberFirstName.current,
            last_name : memberLastName.current,
            middle_initial : memberMiddleInitial.current,
            organization_uuid : org_uuid
        });

        memberFirstName.current = "";
        memberLastName.current = "";
        memberMiddleInitial.current = "";
        
        if(!!fnRef.current) fnRef.current.value = memberFirstName.current;
        if(!!lnRef.current) lnRef.current.value = memberLastName.current;
        if(!!miRef.current) miRef.current.value = memberMiddleInitial.current;

        

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
            organization settings
        </>
    );
}

export default OrganizationSettings;