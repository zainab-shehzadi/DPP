import { usePathname,useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

const restrictedRoutes = ["/UserSetting", "/AddNewUser", "/AddUser"];
const allowedRoles = ["Director", "Manager", "Supervisor", "Staff", "Assistant", "Liaison"];

const withPrivateProtected = (WrappedComponent: any) => {
  return (props: any) => {
    const router = useRouter();
    const pathname = usePathname(); 
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    useEffect(() => {
      if (!token) {
        router.push("/LoginPage"); 
        return;
      }

      if (role === "admin" && !restrictedRoutes.includes(pathname)) {
        router.push("/UserSetting");
        return;
      }

      if (restrictedRoutes.includes(pathname) && role && allowedRoles.includes(role)) {
        router.push("/Dashboard");
        return;
      }
    }, [token, role, pathname]);

    return <WrappedComponent {...props} />;
  };
};

export default withPrivateProtected;
