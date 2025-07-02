import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import type { NavigateFunction } from "react-router-dom";
import { getUser, supabase } from "../supabase";


export const validateEmail = (email : string) => {
    const emailRegex : RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!emailRegex.test(email)) return 'Email is invalid!';
    return 'valid';
}

export const validateUsername = ( username: string) => {
    const usernameRegex : RegExp = /^[a-zA-Z][a-zA-Z0-9]*$/;

    if(!usernameRegex.test(username)) return 'Username must only contain alpha-numeric characters with numbers after'
    if(username.length < 3) return 'Username must be more than 3 characters long!';
    return 'valid';
}

export const validateName = (name : string) => {
    const nameRegex : RegExp = /^[A-Za-zÀ-ÖØ-öø-ÿ'’\- ]{1,50}$/;
    if(!nameRegex.test(name)) return 'Invalid name'
    if(name.length < 3) return 'A name must be more than 3 characters long!';
    return 'valid';
}

export const validatePassword = (password: string) => {
    if(password.length < 8) return 'Password must have atleast 8 characters!';

    return 'valid';
}

export const logout = async() => {
    await supabase.auth.signOut({ scope : 'local'}); //only logout on this browser
}


