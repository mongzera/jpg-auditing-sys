import { useState } from "react";

export interface MemberCollectionProp{
    darken : boolean,
    name : string,
    collection_status : boolean[]
}

function MemberCollectionStatus(props : MemberCollectionProp){
    const {name, collection_status, darken} = props;

    return ( 
        <>
            <tr className={darken ? "darken-row" : "white-row"}>
                <td className={"sticky-col " + (darken ? "darken-row" : "white-row")}><p className="p-0 my-2">{name}</p></td>
                {collection_status.map((isPaid)=>{ return <td ><span className="d-flex flex-row align-items-center w-100 justify-content-center"><p className={'member-payment-status ' + (isPaid ? 'member-paid' : 'member-unpaid')}>{isPaid ? 'OR No. 4123 - Paid' : 'Unpaid'}</p></span></td>})}
            </tr>
        </>
    );
}

export default MemberCollectionStatus;