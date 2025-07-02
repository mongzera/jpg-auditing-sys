import { createClient } from '@supabase/supabase-js';
import { logout } from './auth/AuthUtil';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const USER_ID = 'user_id';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUser = async() => {
    // const {data : {session}, error} = await supabase.auth.getUser();
    // if(!!session?.user){
    //     //sessionStorage.setItem('user_id', JSON.parse(session.user.id))
    //     console.log(session.user.id);
    //     return session.user;
    // }

    
    const {data, error} = await supabase.auth.getUser();
    if(!!data.user){
        return data.user;
    }
    logout();
    return null;
}
