import connectDB from '@/lib/db';
import Participant from '@/models/participant';
import { currentUser } from '@clerk/nextjs/server';

connectDB();

export async function DELETE(req) {
  try {
    const user = await currentUser();

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const role = user.publicMetadata?.user;
    if (role !== 'admin') {
      return new Response(
        JSON.stringify({ message: 'Forbidden: Admins only' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ message: 'Participant ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const deletedParticipant = await Participant.findByIdAndDelete(id);

    if (!deletedParticipant) {
      return new Response(
        JSON.stringify({ message: 'Participant not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Participant deleted successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
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
