"use client"; 

import { usePathname, useRouter } from "next/navigation"; 
import { useEffect, ComponentType } from "react";
import Cookies from "js-cookie";

const publicRoutes: string[] = ["/login", "/signup", "/forgetpassword", "/reset-password", "/reset","/verify-email","/form-detail",];

const authPublicRoutes = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ProtectedComponent: React.FC<P> = (props) => {
    const router = useRouter(); 
    const pathname = usePathname(); 
    const token: string | undefined = Cookies.get("token"); 
    const role: string | undefined = Cookies.get("role"); 
    

useEffect(() => {
  if (token && role && role !== "admin" && publicRoutes.includes(pathname)) {
    router.replace("/Dashboard");
  }
}, [token, role, pathname, router]);

    return <WrappedComponent {...props} />;
  };

  return ProtectedComponent;
};

export default authPublicRoutes;
