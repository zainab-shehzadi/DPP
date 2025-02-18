import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Cookies from "js-cookie"; 
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone(); 
  const token = req.cookies.get("token")?.value; // Token stored in cookies
  const role = req.cookies.get("role")?.value; // Role stored in cookies
  const email = Cookies.get("email");

   const status = req.cookies.get("VerifyStatus")?.value; 

  if (url.pathname === "/") {
    console.log("Root route accessed. Redirecting to /landing...");
    url.pathname = "/landing"; 
    return NextResponse.redirect(url);
  }
  const publicRoutes = ["/LoginPage", "/signup", "/forgetpassword", "/resetpassword","/reset"];
  if (publicRoutes.some((route) => url.pathname.startsWith(route))) {
    
   
    if (!status) {
      return NextResponse.next();
    }

    // Redirect based on user status
    switch (status) {
      case "onboarding":
      
        return NextResponse.redirect(new URL(`/FormDetail?email=${email}`, req.url));

      case "pending":
        return NextResponse.redirect(new URL("/verifyemail", req.url));

      case "verified":
        return NextResponse.redirect(new URL("/", req.url));

     
    }
  }
  if (publicRoutes.some((route) => url.pathname.startsWith(route))) {
    console.log(`Public route accessed: ${url.pathname}`);
    return NextResponse.next(); 
  }
  if (
    url.pathname.startsWith("/UserSetting") ||
    url.pathname.startsWith("/AddNewUser") ||
    url.pathname.startsWith("/AddUser")
    
  ) {
    if (role && ["Director", "Manager", "Supervisor", "Staff", "Assistant", "Liaison"].includes(role) && token) {
      return NextResponse.next(); 
    } else {
      console.log("Access denied. Admin role is required. Redirecting to /Login...");
      url.pathname = "/LoginPage";
      return NextResponse.redirect(url); 
    }
  }

 
  if (
    url.pathname.startsWith("/HistoryPage") ||
    url.pathname.startsWith("/InsightPage") ||
    url.pathname.startsWith("/TaskDetailPage") ||
    url.pathname.startsWith("/DailySummaries") ||
    url.pathname.startsWith("/TaskListPage") ||
    url.pathname.startsWith("/landing") ||
    url.pathname.startsWith("/AboutUs") ||
    url.pathname.startsWith("/facilitySetting") ||
    url.pathname.startsWith("/profileSetting") 

  ) {
    if (role && ["Director", "Manager", "Supervisor", "Staff", "Assistant", "Liaison"].includes(role) && token) {
      console.log("User role detected. Proceeding to user page...");
      return NextResponse.next();
    } else {
      console.log("Access denied. User role is required. Redirecting to /Login...");
      url.pathname = "/LoginPage";
      return NextResponse.redirect(url);
    }
  }

  
  console.log("Route not matched or user not authenticated. Redirecting to /Login...");
  url.pathname = "/LoginPage";
  return NextResponse.redirect(url);
}


export const config = {
  matcher: [
    "/Dashboard", 
    "/signup", 
    "/reset",
    "/forgetpassword", 
    "/UserSetting", 
    "/AddNewUser", 
    "/AddUser",
    "/HistoryPage", 
    "/InsightPage", 
    "/TaskDetailPage",
    "/DailySummaries", 
    "/TaskListPage", 
    "/profileSetting",
    "/facilitySetting",
    "/",
  ],
};
