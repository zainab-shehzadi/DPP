import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const restrictedRoutes = ["/UserSetting", "/AddNewUser", "/AddUser"];
const adminRestrictedRoutes = ["/AdminDashboard", "/ManageUsers"]; // Example admin pages
const allowedRoles = ["Director", "Manager", "Supervisor", "Staff", "Assistant", "Liaison"];

const withPrivateProtected = (WrappedComponent: any) => {
  return (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const token = Cookies.get("token");
    const email = Cookies.get("email");
    const [role, setRole] = useState<string | null>(Cookies.get("role") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!token) {
        router.push("/login");
        return;
      }

      const fetchUser = async () => {
        try {
          console.log("Fetching user data from:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email`);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ email }),
            }
          );

          if (!response.ok) {
            Cookies.remove("token");
            Cookies.remove("role");
            router.push("/login");
            return;
          }

          const user = await response.json();
          if (!user || !user.role) {
            router.push("/login");
            return;
          }

          Cookies.set("role", user.role); // Save updated role
          setRole(user.role); // Update role in state
        } catch (error) {
          console.error("Error fetching user details:", error);
          router.push("/login");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }, [token, pathname]);

 
    if (loading) {
      return <p></p>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withPrivateProtected;
