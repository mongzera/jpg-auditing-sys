import { useRef, useState } from "react";
import Select from "../../../widgets/Select";
import Input from "../../../widgets/Input";
import SearchBar from "../../../widgets/SearchBar";

interface MembersToBeCollected{
    name : string,
    or_number : number,
    date_paid : string
}

function RecordCollection(){
    const members_arr:string[] = [
        'Gamat, Ethan James R.',
        'Mendoza, AJ Boy T.',
        'Haresco, Caehl Juzua.',
        'Ruyeras, Ella Thea Marie Jonathan',
        'Rojas, Rage Galit P.',
        'Manlunes, Jaeser P.'
    ];

    const collectionName = useRef<string>("");
    const memberName = useRef<string>("");

    const [membersToBeCollected, setMembersToBeCollected] = useState<MembersToBeCollected[]>([]);

    const addMemberToBeCollected = () => {
        let newMember : MembersToBeCollected = {
            name: memberName.current,
            or_number: membersToBeCollected!.length,
            date_paid: "2025-6-3"
        }

        //clear search bar
        memberName.current = "";
        (document.getElementById('member_name_input') as HTMLInputElement).value = memberName.current;

        //check if this member has been added already
        if(!!membersToBeCollected.find((item)=>item.name === newMember.name)){
            alert("This member has been added already!");
            return;
        }

        //check if this member really exists
        if(!members_arr.find((member)=>member === newMember.name)){
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
                            <td><h6 style={{textAlign: 'center'}}>{member.date_paid}</h6></td>
                            <td><i className="bi bi-trash" style={{color: '#FF0000'}} onClick={()=>{deleteMember(member)}}></i></td>
                        </tr>
                    );
                })}
            </>
        );
    }

    const submitCollection = () => {
        
    }

    return (
        <>
            <div className="jcard" style={{gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 1}}>
                <div className="jcard-header my-2">
                    
                    <div className="d-flex justify-content-between align-items-center">
                        <h6>Record Collections</h6>
                        <Select label={'Record for collection: '} choices={['Membership Fee', 'Karajan Fee', 'Lanyard Fee']} valueRef={collectionName}/>
                    </div>
                </div>
                <div className="jcard-content">
                    <div className="search-bar d-flex flex-row align-items-end justify-content-between">
                        <SearchBar label={"Search Member: "} type={"text"} valueRef={memberName} className={""} id={"member_name_input"} array={members_arr} />
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default RecordCollection;