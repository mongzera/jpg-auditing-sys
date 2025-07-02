import './Sidebar.css'
import logo from '../assets/jpg_logo.webp'
import { useEffect, useState } from 'react';
import { getUser, supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth/AuthUtil';
import { fetchUserOrgData, getUserOrgData, USER_ORG_DATA } from '../utils/user-util';

function SideBar(props : any){
    const [activeNav, setActiveNav] = useState<any>(null);
    const [sidebarClose, setSidebarClose] = useState(false);

    const [username, setUsername] = useState("");
    const [organizationAbbv, setOrganizationAbbv] = useState("");
    const [userPosition, setUserPosition] = useState("");

    const navigate = useNavigate();
    

    useEffect(  ()=>{
        
        const data = getUserOrgData();

        if(!data) logout();

        const user_fullname = data!.username;
        const user_organization = data!.tb_organization.organization_name;
        const user_organization_abbv = data!.tb_organization.organization_abbv;
        const user_organization_position = data!.position;

        setUsername(user_fullname);
        setOrganizationAbbv(user_organization_abbv);
        setUserPosition(user_organization_position);

    }, [])

    const toggleSidebar = () => {

        const sidebar = (document.getElementById('side-bar') as HTMLDivElement);

        if (sidebar.classList.contains('side-bar-close')) {
            sidebar.classList.remove('side-bar-close');
            setSidebarClose(false);
        } 
        else {
            sidebar.classList.add('side-bar-close');
            setSidebarClose(true);
        }
    }

    const sidebarToggleButton = () => {
        if(!sidebarClose){
            return <i className="bi bi-arrow-left side-bar-toggle" onClick={toggleSidebar}></i>
        }else{
            return <i className="bi bi-arrow-right side-bar-toggle" onClick={toggleSidebar}></i>
        }
    }

    const setCurrentNav = (e : EventTarget) => {
        if(activeNav != null){
            activeNav.classList.remove('active-nav');
        }

        (e as HTMLElement).classList.add('active-nav');
        setActiveNav(e);
        
    }

    return (
        <div className="side-bar d-flex flex-column justify-content-between" id='side-bar'>
            <div className="upper-part p-3">
                <div className="user-options d-flex flex-row justify-content-between">
                    <div className='d-flex flex-row align-items-center'>
                        <i className="bi bi-person profile"></i>
                        <div className="user-detail  mx-2">
                            <h6 className='' style={{borderBottom: '3px solid #FFF', paddingBottom: '5px'}}>{username}</h6>
                            <h6 style={{color: '#FEFEFE !important'}}>{organizationAbbv}:{userPosition}</h6>
                        </div>
                    </div>
                    {sidebarToggleButton()}
                </div>
                <div className="navigation d-flex flex-column w-100">
                    {
                        //in this case, @param `key` is the uri
                        Object.keys(props.viewObject).map( (key, index) => {
                            
                            const uri = key;
                            const label = props.viewObject[uri].label;
                            return <p className="side-bar-nav" onClick={(e)=>{ if(sidebarClose) return; setCurrentNav(e.currentTarget); props.changeCurrentViewCallback(uri); }}>{label}</p>
                        })
                    }

                    <p className="side-bar-nav" onClick={(e)=>{ logout()}}>Log Out</p>
                        
                    
                </div>
                
            </div>
            
            <div className="footer w-100 d-flex flex-row">
                <img className="logo" src={logo} alt="jpg-logo" />
                <div className="info">
                    <div className="jpg-name w-100"><h6>Developed by <b>Junior Programmers Group</b></h6></div>
                    <div className="soc-med text-right w-100"><p>Version 0.95-2025</p></div>
                </div>
            </div>
            
        </div>
    );
}

export default SideBar;