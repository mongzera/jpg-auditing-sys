import { useEffect, useState } from "react";
import './Modal.css'

interface ModalProps{
    display:boolean,
    title : string,
    content : React.ReactNode,
    cancelCallback : Function,
    confirmCallback : Function

}

function Modal(props : ModalProps){
    let {display, title, content, cancelCallback, confirmCallback} = props;

    if(!display) return null;

    return (
        <div className="jmodal-backpanel">
            <div className="jmodal" tabIndex={-1}> 
                <div className="jmodal-header">
                    <h6 className="m-0">{title}</h6>
                </div>
                <div className="jmodal-content">
                    {content}
                </div>
                <div className="jmodal-footer">
                    <button className="btn bbtn-outline-darktn" onClick={(e)=>{cancelCallback()}}>Cancel</button>
                    <button className="btn btn-danger"  onClick={(e)=>{ confirmCallback()}}>Confirm</button>
                </div>
            </div>
        </div>
    );
}

export default Modal;