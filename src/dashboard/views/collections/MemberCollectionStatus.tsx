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
            <tr style={{backgroundColor:(darken ? 'rgb(255, 243, 243)' : '')}}>
                <td className="px-2"><p className="p-0 my-2">{name}</p></td>
                {collection_status.map((isPaid)=>{ return <td ><span className="d-flex flex-row align-items-center w-100 justify-content-center"><input type="checkbox" defaultChecked={isPaid===true}/><p className="my-0 mx-2">Is Paid</p></span></td>})}
            </tr>
        </>
    );
}

export default MemberCollectionStatus;