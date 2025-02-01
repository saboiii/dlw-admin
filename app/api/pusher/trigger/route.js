import Pusher from 'pusher';
import { NextResponse } from 'next/server';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(request) {
  try {
    const body = await request.json();
    await pusher.trigger('online-channel', 'user-connected', {
      profilePicture: body.imageUrl || '/images/default-profile.jpg',
      name: body.fullName || 'Anonymous',
    });
    return NextResponse.json({ message: 'Event triggered' });
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return NextResponse.error();
  }
}
