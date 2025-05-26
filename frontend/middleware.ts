import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value; 
  const role = req.cookies.get("role")?.value; 
  const email = req.cookies.get("email")?.value; 
  const status = req.cookies.get("VerifyStatus")?.value;

  const publicRoutes = ["/login", "/signup", "/forgetpassword", "/reset-password", "/reset"];
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

  if (url.pathname === "/") {
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }
if(!token){
  if (status === "onboarding") {
    return NextResponse.redirect(new URL(`/form-detail`, req.url));
  } else if (status === "pending") {
    return NextResponse.redirect(new URL("/verify-email", req.url));
  }
}
 
  if (token) {
    if (status === "verified") {
      return NextResponse.next();
    }
  }

  if (!token && publicRoutes.includes(url.pathname)) {
    return NextResponse.next();
  }

  if (!token && privateRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
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