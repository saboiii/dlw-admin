import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(request) {
  try {

    const rawBody = await request.text();
    const params = new URLSearchParams(rawBody);

    let socket_id, channel_name;
    socket_id = params.get('socket_id');
    channel_name = params.get('channel_name');

    const presenceData = {
      user_id: params.get('userId'),
      user_info: {
        firstName: params.get('firstName') || 'Anonymous',
        imageUrl: params.get('imageUrl') || '/images/default-profile.jpg',
      },
    };

    const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.error();
  }
}

