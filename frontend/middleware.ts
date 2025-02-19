import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Cookies from "js-cookie";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value; 
  const role = req.cookies.get("role")?.value; 
  const email = Cookies.get("email");
  const status = req.cookies.get("VerifyStatus")?.value;

  const publicRoutes = ["/LoginPage", "/signup", "/forgetpassword", "/resetpassword", "/reset"];
  const privateRoutes = [
    "/Dashboard",
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
  ];

  // Redirect root to landing page
  if (url.pathname === "/") {
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  // If user is logged in, handle status-based redirections
  if (token) {
    if (status === "onboarding") {
      return NextResponse.redirect(new URL(`/FormDetail?email=${email}`, req.url));
    } else if (status === "pending") {
      return NextResponse.redirect(new URL("/verifyemail", req.url));
    } else if (status === "verified") {
      return NextResponse.next();
    }

    // Prevent logged-in users from accessing public routes
    if (publicRoutes.includes(url.pathname)) {
      url.pathname = "/Dashboard"; 
      return NextResponse.redirect(url);
    }

  }

  // Allow non-logged-in users to access public routes
  if (!token && publicRoutes.includes(url.pathname)) {
    return NextResponse.next();
  }

  // Prevent non-logged-in users from accessing private routes
  if (!token && privateRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/LoginPage", req.url));
  }

  // Role-based access control
  const restrictedRoutes = ["/UserSetting", "/AddNewUser", "/AddUser"];
  if (restrictedRoutes.includes(url.pathname)) {
    if (!role || !["Director", "Manager", "Supervisor", "Staff", "Assistant", "Liaison"].includes(role)) {
      return NextResponse.redirect(new URL("/LoginPage", req.url));
    }
  }

  return NextResponse.next();
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