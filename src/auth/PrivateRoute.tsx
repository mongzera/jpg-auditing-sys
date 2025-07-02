// PrivateRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUser, supabase } from "../supabase";
import { clearUserOrgData, fetchUserOrgData } from "../utils/user-util";

export default function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const fetch = async() => {
      await getUser();  
      await fetchUserOrgData();
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setLoading(false);
      fetch()
    });

    const { data : {subscription} } = supabase.auth.onAuthStateChange((event, session) => {

        setIsAuthed(!!session);
        fetch();
        
        if (event === 'INITIAL_SESSION') {
        // handle initial session
          
          

        } else if (event === 'SIGNED_IN') {
        // handle sign in event

          console.log('sigin');
        } else if (event === 'SIGNED_OUT') {
        // handle sign out event
          clearUserOrgData();
          console.log('clearing');
        } else if (event === 'PASSWORD_RECOVERY') {
        // handle password recovery event

        } else if (event === 'TOKEN_REFRESHED'){
        // handle token refreshed event

        } else if (event === 'USER_UPDATED') {
        // handle user updated event
            
            
        }



      
      
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Or spinner

  return isAuthed ? <Outlet /> : <Navigate to="/login" />;
}
