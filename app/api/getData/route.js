import connectDB from '@/lib/db';
import Participant from '@/models/participant';

connectDB();

export async function GET(req) {
  try {
    const participants = await Participant.find({});
    return new Response(JSON.stringify({ participants }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
