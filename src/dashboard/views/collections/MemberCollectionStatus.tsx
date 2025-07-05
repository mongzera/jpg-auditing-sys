import { useState } from "react";
import type { MemberCollectionPaymentStatus, OrganizationCollections } from "./Collections";

export interface MemberCollectionProp{
    darken : boolean,
    name : string,
    collections : OrganizationCollections[] | undefined
    collection_status : MemberCollectionPaymentStatus[] | undefined
}

function MemberCollectionStatus(props : MemberCollectionProp){
    const {name, collection_status, darken, collections} = props;
    
    return ( 
        <>
            <tr className={darken ? "darken-row" : "white-row"}>
                <td className={"sticky-col " + (darken ? "darken-row" : "white-row")}><p className="p-0 my-2">{name}</p></td>
                
                
                {collections?.map((collection)=>{
                    let transaction_receipt = collection_status?.find((status) => status.collection_uuid === collection.id)?.transaction_receipt ?? '';

                    let isPaid = !!transaction_receipt;

                    return (
                        <>
                            <td ><span className="d-flex flex-row align-items-center w-100 justify-content-center"><p className={'member-payment-status ' + (isPaid ? 'member-paid' : 'member-unpaid')}>{isPaid ? `${transaction_receipt} Paid` : 'Unpaid'}</p></span></td>
                        </>
                    );
                })}

                
            </tr>
        </>
    );
}

export default MemberCollectionStatus;