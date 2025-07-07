import { useNavigate } from "react-router-dom";
import AuthInput from "../../auth/AuthInput";
import Input from "../../widgets/Input";
import './CreateOrganization.css'
import { useEffect, useRef, useState } from "react";
import { getUser, supabase } from "../../supabase";
import { fetchUserOrgData } from "../../utils/user-util";

function CreateOrganization(props : any){

    const organizationNameInputRef = useRef<HTMLInputElement>(null);
    const organizationDescriptionInputRef = useRef<HTMLInputElement>(null);
    const organizationAbbvInputRef = useRef<HTMLInputElement>(null);

    const createOrganization = async() => {
        //validate all inputs
        const errors: string[] = [];

        if(!organizationNameInputRef.current && !organizationDescriptionInputRef.current && !organizationAbbvInputRef.current){
            alert("Technical Errors occured\nPlease refresh and retry...");
            return;
        }

        // Trim all input first
        const name = organizationNameInputRef.current!.value.trim();
        const desc = organizationDescriptionInputRef.current!.value.trim();
        const abbv = organizationAbbvInputRef.current!.value.trim();

        // 🔍 Validation rules
        if (!name) {
            errors.push("Organization name is required.");
        } else if (name.length < 3) {
            errors.push("Organization name must be at least 3 characters long.");
        }

        if (!abbv) {
            errors.push("Organization abbreviation is required.");
        } else if (!/^[A-Z]{1,7}$/.test(abbv)) {
            errors.push("Abbreviation must be 1–7 uppercase letters only.");
        }

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        //if no errors
        const { data, error} = await supabase.from('tb_organization').insert( {
            organization_name : name,
            organization_abbv : abbv,
            organization_description : desc
        } ).select().single();

        if(error) {
            alert(error.message);
            return;
        }

        //update 
        const updateUserOrgPrivilage = async() => {
            console.log(data);

            let user = await getUser();

            if(!!user) {
                const {error} = await supabase.from('tb_user_org_privilege').update({
                    privilege : 'admin',
                    organization_id : data.id
                }).eq('id', user.id);

                if(error) {
                    alert(error.message);
                    return;
                }
            }

            //re-fetch again to set items on localstorage
            await fetchUserOrgData();
            props.setHasOrganization(true);

        }

        updateUserOrgPrivilage();
        
    }

    useEffect( ()=> {
        fetchUserOrgData();
    })

    return (
        <>
            <div className="background d-flex justify-content-center align-items-center p-0 m-0">
                <div className="jcard jcard-medium w-50 h-50 p-5">
                    <h3 className="mb-5">Create Organization</h3>
                    <Input className="w-100 my-5" label="Organization Name" type="text" inputRef={organizationNameInputRef}/>
                    <Input className="w-100 my-5" label="Organization Description" type="text" inputRef={organizationDescriptionInputRef}/>
                    
                    <div className="d-flex flex-row w-100 align-items-end justify-content-between">
                        <Input className="w-50" label="Organization Abbreviation" type="text" inputRef={organizationAbbvInputRef}/>
                        
                    </div>
                    <div className="d-flex flex-row justify-content-end"> 
                        <button className="btn btn-danger" onClick={()=>{createOrganization()}}>Create Organization</button>
                    </div>
               </div>
                

            </div>
        </>
    );
}

export default CreateOrganization;