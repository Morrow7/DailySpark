import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST() {
  // Simulate WeChat OAuth Callback
  // In reality: Exchange code for access_token & openid -> Get User Info
  
  // Mock User
  const mockUser = {
    id: 1,
    name: "WeChat User",
    email: "wechat@example.com",
    avatar: "https://img.icons8.com/color/48/000000/weixing.png", // WeChat Icon
    membership: {
      level: "free",
      endTime: null
    }
  };

  const token = signToken({ userId: mockUser.id, email: mockUser.email });

  return NextResponse.json({
    token,
    user: mockUser
  });
}
