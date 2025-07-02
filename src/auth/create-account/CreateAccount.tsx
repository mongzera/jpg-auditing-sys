import { useEffect, useRef, useState } from "react";
import '../Auth.css'
import AuthInput from "../AuthInput";
import { supabase } from '../../supabase'
import { useNavigate } from "react-router-dom";


function CreateAccount(){
    const usernameValidRef = useRef<boolean>(false);
    const emailValidRef = useRef<boolean>(false);
    const passwordValidRef = useRef<boolean>(false);

    const username = useRef<string>("");
    const email = useRef<string>("");
    const password = useRef<string>("");
    const navigate = useNavigate();

    const validateAndCreateAccount = async() => {
        let failed = false;
        if(usernameValidRef && emailValidRef && passwordValidRef){
            const { data: signUpData, error } = await supabase.auth.signUp({
                email : email.current,
                password : password.current
            });

            if (error){
                alert(error.message);
                failed = true;
            }

            if(failed) return;

            const user = signUpData.user;

            if(!user){
                alert("Failed to create account!");
                failed = true;
            } 

            if(failed) return;

            const { data, error : usernameError} = await supabase.from('tb_user_org_privilege').insert({
                id: user!.id,
                username: username.current
            });

            if(usernameError) {
                alert(usernameError.message);
                failed = true;
            }
        }
        
        else console.log("Not all valid!");
    }

    useEffect( ()=>{
        const { data : {subscription} } = supabase.auth.onAuthStateChange((_event, session) => {
            if(!!session) navigate('/dashboard');
        });
    });

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h3 className="mb-5">Create an Account</h3>
                <AuthInput placeholder="" label="Full name" type="name" validityRef={usernameValidRef} valueRef={username}/>
                <AuthInput placeholder="" label="Email" type="email" validityRef={emailValidRef} valueRef={email}/>
                <AuthInput placeholder="" label="Password" type="password" validityRef={passwordValidRef} valueRef={password}/>
                <input className="auth-button my-2" type="submit" value="Create Account" onClick={ (e) => { validateAndCreateAccount(); }} />
                <a style={{textAlign:'center', color:'#FF0000', textDecoration:'underline', fontSize:'0.75rem'}}onClick={()=>{navigate('/login')}}>Already have an account?</a>
            </div>

            <div className="footer">
                <h1>JPG Auditing System</h1>
                <p>Version 0.9-2025</p>
            </div>
        </div>
    );
}

export default CreateAccount;