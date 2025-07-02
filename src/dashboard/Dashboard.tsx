import { useEffect, useState } from 'react'
import './Dashboard.css'
import SideBar from './Sidebar'
import CurrentView from './CurrentView'
import Summary from './views/summary/Summary'
import Collections from './views/collections/Collections'
import Accounts from './views/accounts/Accounts'
import { fetchUserOrgData, USER_ORG_DATA, userHasOrganization } from '../utils/user-util'
import CreateOrganization from './views/CreateOrganization'
import OrganizationSettings from './views/organization_settings/OrganizationSettings'
import Transactions from './views/transactions/Transactions'
import { fetchOrganizationAccountsTypes } from '../utils/organization-utils'

const viewObject = {
  summary : {label : "Summary", view : <Summary/>},
  cashflow : {label : "Transaction", view : <Transactions />},
  collections : {label : "Collections", view : <Collections />},
  accounts : {label : "Accounts", view : <Accounts />},
  organization_settings : {label : "Organization Settings", view : <OrganizationSettings/>}
}

function Dashboard() {

  const [hasOrganization, setHasOrganization] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect( ()=>{
    const fetch = async () =>{
      await fetchUserOrgData();
      await fetchOrganizationAccountsTypes();

      if(!!sessionStorage.getItem(USER_ORG_DATA)) setLoading(false);
      
    }
    
    const status = userHasOrganization();

    if(status === 'true'){
      setHasOrganization(true);
      setLoading(false);
    }else if (status === 'no_data'){
      //need to retry fetching again if data hasnt arrived yet
      fetch();
      setLoading(true);
    }else{
      setHasOrganization(false);
      setLoading(false);
    }

  }, [loading]);

  const [currentView, setCurrentView] = useState<keyof typeof viewObject>("summary");

  if(loading){
    return <h2>Please wait...</h2>
  }

  if(!hasOrganization){
    return <CreateOrganization setHasOrganization={setHasOrganization}/>
  }
  

  return (
   <>
      <div className="dashboard d-flex flex-row w-100">
        <SideBar viewObject={viewObject} changeCurrentViewCallback={setCurrentView}></SideBar>
        <CurrentView displayName={viewObject[currentView].label} displayView={viewObject[currentView].view}></CurrentView>
      </div>
   </>
  )
}

export default Dashboard
