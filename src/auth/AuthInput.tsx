import { useState } from "react";
import {validateEmail, validateUsername, validatePassword, validateName} from './AuthUtil'

interface AuthInputProp {
    label : string,
    type : string,
    placeholder : string,
    valueRef : React.RefObject<string>
    validityRef : React.RefObject<boolean>
}

let AuthInput = (props : AuthInputProp) => {
    const [valid, setValid] = useState("");
    const [hidePassword, setHidePassword] = useState(true);

    let type = 'text';

    if(props.type === 'password'){
        type = 'password';
    }

    const validateInputs = (value : string) => {
        let status : string = '';

        if(props.type === 'username'){
            status = validateUsername(value);
        } 
        
        else if(props.type === 'email'){
            status = validateEmail(value);
        } 
        
        else if(props.type === 'password'){
            status = validatePassword(value);
        }

        else if(props.type === 'name'){
            status = validateName(value);
        }

        else if(props.type === 'username|email' || props.type === 'email|username'){
            
            if(value.includes('@')){
                status = validateEmail(value);
            }else{
                status = validateUsername(value);
            }
        }
        
        setValid(status);

        if(status === 'valid') {
            props.valueRef.current = value;
            props.validityRef.current = true;
        }
        else{
            props.valueRef.current = "";
            props.validityRef.current = false;
        } 
        
    }

    //{type === 'password' ? (hidePassword ? <i className="bi bi-eye-slash auth-eye" onClick={(e)=>{setHidePassword(prev=>!prev)}}></i> : <i className="bi bi-eye auth-eye" onClick={(e)=>{setHidePassword(prev=>!prev)}}></i>) : ''}
            
    
    return (
        <div className="my-3 w-100">
            <div className="d-flex flex-column">
                <p className="auth-label">{props.label}</p> 
                
            </div>
            <div className="inputs d-flex flex-row">
                <input className="auth-input w-100" type={(props.type === 'password' ? (hidePassword ? type : 'text') : 'text')} placeholder={props.placeholder ?? ""} name={props.label} id={props.label} onChange={ (e) => { validateInputs(e.currentTarget.value) } }/>
                {(type === 'password' ? <i className={"bi bi-eye" + (hidePassword ? "-slash" : "") + " auth-eye"} onClick={ (e)=>{ setHidePassword(prev=>!prev) } }/> : '')}
                </div>
            <p className={"auth-label-error " + (valid === 'valid' ? 'auth-valid' : '')}>{(valid != "" && valid != 'valid') ? "*" + valid : (valid === 'valid' ? 'Acceptable' : '')}</p>
        </div>
    );
}

export default AuthInput;