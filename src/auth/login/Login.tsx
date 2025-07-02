import { useEffect, useRef, useState } from "react";
import AuthInput from "../AuthInput";
import { getUser, supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";


function Login(){
        const navigate = useNavigate();
        const emailValid = useRef<boolean>(false);
        const passwordValid = useRef<boolean>(false);

        const email = useRef<string>("")
        const password = useRef<string>("")
    
        const validateAndCreateAccount = async() => {


            console.log(email.current, password.current);
            if(emailValid.current && passwordValid.current){

                const {data, error} = await supabase.auth.signInWithPassword( {
                    email : email.current!,
                    password : password.current!
                } );

                if(error) alert(error.message);

                if(data.user !== null){
                    navigate('/dashboard')
                }

            }else console.log("Not all valid!");
        }
    

        useEffect( ()=> {
            const { data : {subscription} } = supabase.auth.onAuthStateChange((_event, session) => {
                if(!!session) navigate('/dashboard');
            });


            const keyEnter = (event : any) => {
                if (event.key === 'Enter') {
                    validateAndCreateAccount();
                    event.preventDefault()
                }
            }

            document.addEventListener('keydown', keyEnter)

            return () => {
                document.removeEventListener('keydown', keyEnter)
            }

        }, []);

        return (
            <div className="auth-container">   
                    <div className="auth-card">
                        <h3 className="mb-5">Login Account</h3>
                        <AuthInput placeholder="" label="Email" type="email" valueRef={email} validityRef={emailValid}/>
                        <AuthInput placeholder="" label="Password" type="password" valueRef={password} validityRef={passwordValid}/>
                        <input className="auth-button my-2" type="submit" value="Login Account" onClick={ (e) => { validateAndCreateAccount(); }} />
                    </div>
                    <a style={{textAlign:'center', color:'#FF0000', textDecoration:'underline', fontSize:'0.75rem'}}onClick={()=>{navigate('/create-account')}}>Sign in instead?</a>
                
                <div className="footer">
                    <h1>JPG Auditing System</h1>
                    <p>Version 0.9-2025</p>
                </div>
            </div>
        );
}

export default Login;