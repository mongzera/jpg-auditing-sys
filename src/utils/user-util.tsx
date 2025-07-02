import { supabase, getUser, USER_ID } from "../supabase"

export const USER_ORG_DATA = 'user_org_data';

export interface OrganizationData{
    id : string,
    organization_name : string,
    organization_abbv : string,
    organization_description : string,
}

export interface UserOrganizationData{
    id : string,
    username : string,
    privilage : string,
    position : string,
    organization_id : string,
    tb_organization : OrganizationData
}

export const fetchUserOrgData = async() => {
    const user = await getUser();

    if(!!user){
        const {data,error} = await supabase.from('tb_user_org_privilege').select('* , tb_organization ( organization_name, organization_abbv, organization_description)').eq('id', user.id).single();

        if(error){
            console.error(error.message);
            return;
        }


        console.log('Fetching USER ORG DATA');
        sessionStorage.setItem(USER_ORG_DATA, JSON.stringify(data));
        console.log("FETCHED: " + JSON.parse(sessionStorage.getItem(USER_ORG_DATA)!));

    }else{
        console.log("Cannot fetch user organization data!");
    }

}

/** @returns 
 *  string `no_data` = probably hasnt fetchedUserOrgData
 *  string `false` = no organization
 *  string `true` = has organization
 **/

export const userHasOrganization = () : string => {
    
    const data = getUserOrgData();

    console.log(data);

    if(!data) {
        return 'no_data';
    }

    return (data.organization_id === '' || data.organization_id === 'null' || !!data.organization_id === false) ? 'false' : 'true';
}

export const getUserOrgData = () : (UserOrganizationData | null) => {
    if(!!sessionStorage.getItem(USER_ORG_DATA) == false) return null;

    const data = JSON.parse(sessionStorage.getItem(USER_ORG_DATA)!);

    const userOrgData : UserOrganizationData = data;

    return userOrgData;
}

export const clearUserOrgData = () => {
    sessionStorage.clear();
}