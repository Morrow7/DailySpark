import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    // Exchange code for access token and openid
    // Note: For mobile app login, the URL is slightly different than web
    const wechatUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`;
    
    // Mocking WeChat API response for development/demo purposes
    // In production, uncomment the fetch call
    /*
    const response = await fetch(wechatUrl);
    const data = await response.json();
    if (data.errcode) {
      return NextResponse.json({ error: data.errmsg }, { status: 400 });
    }
    const { openid, access_token } = data;
    */
    
    // MOCK DATA for demonstration
    const openid = `mock_openid_${code}`;
    const access_token = 'mock_access_token';

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { wechatOpenId: openid },
    });

    if (!user) {
      // Create new user
      // We might need to fetch user info from WeChat using access_token and openid
      /*
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;
      const userInfoRes = await fetch(userInfoUrl);
      const userInfo = await userInfoRes.json();
      */
     
      // MOCK USER INFO
      const userInfo = {
        nickname: `WeChatUser_${code.substring(0, 4)}`,
        headimgurl: 'https://img.icons8.com/color/48/000000/weixing.png',
      };

      // Generate a random password for the user (they won't use it, but schema requires it)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.$transaction(async (tx) => {
         const newUser = await tx.user.create({
          data: {
            wechatOpenId: openid,
            name: userInfo.nickname,
            avatar: userInfo.headimgurl,
            password: hashedPassword,
            role: 'user',
          },
        });
        
        // Initialize VIP record
        await tx.userMembership.create({
          data: {
            userId: newUser.id,
            level: 'free',
          },
        });
        
        return newUser;
      });
    }

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email });
    const refreshToken = signToken({ userId: user.id, type: 'refresh' }, '7d');

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, avatar: user.avatar, wechatOpenId: user.wechatOpenId },
      token,
      refreshToken
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('WeChat Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
