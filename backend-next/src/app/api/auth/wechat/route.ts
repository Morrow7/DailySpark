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
    // https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Development_Guide.html
    const wechatUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`;
    
    let openid = '';
    let unionid = '';
    let accessToken = '';
    let userInfo: any = {};

    // Use Mock if API credentials are not set or for dev/test codes
    if (!WECHAT_APP_ID || code.startsWith('mock_')) {
        console.log('Using Mock WeChat Login');
        openid = `mock_openid_${code}`;
        unionid = `mock_unionid_${code}`;
        accessToken = 'mock_access_token';
        userInfo = {
            nickname: `WeChatUser_${code.substring(0, 4)}`,
            headimgurl: 'https://img.icons8.com/color/48/000000/weixing.png',
            sex: 1,
            province: 'Guangdong',
            city: 'Shenzhen',
            country: 'CN',
        };
    } else {
        // Real API Call
        const response = await fetch(wechatUrl);
        const data = await response.json();
        
        if (data.errcode) {
            console.error('WeChat Token Error:', data);
            return NextResponse.json({ error: `WeChat Error: ${data.errmsg}` }, { status: 400 });
        }
        
        openid = data.openid;
        unionid = data.unionid; // UnionID only available if configured
        accessToken = data.access_token;

        // Fetch User Info
        const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`;
        const userInfoRes = await fetch(userInfoUrl);
        const userInfoData = await userInfoRes.json();
        
        if (userInfoData.errcode) {
             console.error('WeChat UserInfo Error:', userInfoData);
             return NextResponse.json({ error: `WeChat UserInfo Error: ${userInfoData.errmsg}` }, { status: 400 });
        }
        userInfo = userInfoData;
    }

    // Check if user exists by UnionID (preferred) or OpenID
    // Note: OpenID is specific to the App, UnionID is unique across Apps under same WeChat Open Platform account.
    let user = await prisma.user.findFirst({
      where: {
        OR: [
            { wechatUnionId: unionid ? unionid : undefined }, // Use undefined to ignore if null
            { wechatOpenId: openid }
        ]
      },
      include: {
        membership: true
      }
    });

    if (!user) {
      // Create new user
      // Generate a random password for the user
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.$transaction(async (tx) => {
         const newUser = await tx.user.create({
          data: {
            wechatOpenId: openid,
            wechatUnionId: unionid || undefined,
            name: userInfo.nickname || `User_${openid.substring(0, 6)}`,
            avatar: userInfo.headimgurl,
            password: hashedPassword,
            role: 'user',
          },
        });
        
        // Initialize Membership record
        await tx.userMembership.create({
          data: {
            userId: newUser.id,
            level: 'free',
          },
        });
        
        // Refetch with membership
        return await tx.user.findUnique({
            where: { id: newUser.id },
            include: { membership: true }
        });
      });
    } else {
        // Update user info if needed (optional: keep sync with WeChat)
        // For now, we only update if missing
        if (!user.wechatUnionId && unionid) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { wechatUnionId: unionid },
                include: { membership: true }
            });
        }
    }
    
    if (!user) throw new Error("Failed to create or retrieve user");

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email });
    const refreshToken = signToken({ userId: user.id, type: 'refresh' }, '7d');

    const response = NextResponse.json({
      user: { 
        id: user.id, 
        name: user.name, 
        avatar: user.avatar, 
        wechatOpenId: user.wechatOpenId,
        membership: user.membership
      },
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
