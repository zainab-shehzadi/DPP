import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone(); // Clone the request URL for modifications

  // Retrieve token and role from cookies
  const token = req.cookies.get("token")?.value; // Token stored in cookies
  const role = req.cookies.get("role")?.value; // Role stored in cookies
  const email = req.cookies.get("email")?.value; // Role stored in cookies
  // Log the token and role for debugging
  console.log("Token from cookies:", token);
  console.log("Role from cookies:", role);
  console.log("Role from cookies:", email);


  // Redirect from / to /landing page
  if (url.pathname === "/") {
    console.log("Root route accessed. Redirecting to /landing...");
    url.pathname = "/landing"; // Redirect to landing page
    return NextResponse.redirect(url);
  }

  // Define public routes that don't require authentication
  const publicRoutes = ["/LoginPage", "/signup", "/forgetpassword", "/resetpassword"];

  // Allow access to public routes (login, signup, reset, forgetpassword)
  if (publicRoutes.some((route) => url.pathname.startsWith(route))) {
    console.log(`Public route accessed: ${url.pathname}`);
    return NextResponse.next(); // Allow the request to proceed
  }

  // Check if the user is trying to access the Dashboard route
  if (url.pathname.startsWith("/Dashboard")) {
    if (!token) {
      // If no token, redirect to Login
      console.log("No token found. Redirecting to /Login...");
      url.pathname = "/LoginPage";
      return NextResponse.redirect(url);
    } else {
      // If token exists, allow access to Dashboard
      console.log("Token found. Proceeding to Dashboard...");
      return NextResponse.next();
    }
  }

  // Check for admin-specific pages (UserSetting, AddNewUser, AddUser)
  if (
    url.pathname.startsWith("/UserSetting") ||
    url.pathname.startsWith("/AddNewUser") ||
    url.pathname.startsWith("/AddUser")
    
  ) {
    if (role === "Staff" && token) {
      return NextResponse.next(); // Allow access to admin pages
    } else {
      console.log("Access denied. Admin role is required. Redirecting to /Login...");
      url.pathname = "/LoginPage"; // Redirect to login if user is not an admin or token is missing
      return NextResponse.redirect(url); // Perform the redirect
    }
  }

  // Check if the user is trying to access specific protected routes
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

  // Default case: redirect to Login if no conditions are met
  console.log("Route not matched or user not authenticated. Redirecting to /Login...");
  url.pathname = "/LoginPage";
  return NextResponse.redirect(url);
}

// Configuration for applying middleware to specific routes
export const config = {
  matcher: [
    "/Dashboard", // Protect the Dashboard route
    "/LoginPage", // Public route
    "/signup", // Public route
    "/reset", // Public route
    "/forgetpassword", // Public route
    "/UserSetting", // Admin protected route
    "/AddNewUser", // Admin protected route
    "/AddUser", // Admin protected route
    "/HistoryPage", // User protected route
    "/InsightPage", // User protected route
    "/TaskDetailPage", // User protected route
    "/DailySummaries", // User protected route
    "/TaskListPage", // User protected route
    "/profileSetting",
    "/facilitySetting",
    "/",
  ],
};
