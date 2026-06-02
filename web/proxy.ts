import type { NextRequest } from "next/server";
import { authProxy } from "@/app/proxy/auth-proxy";

export function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
