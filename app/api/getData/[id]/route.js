import connectDB from '@/lib/db';
import Participant from '@/models/participant';
import mongoose from 'mongoose';

connectDB();

export async function GET(req, { params }) {
    const { id } = await params;

    try {

        const participant = await Participant.findById(id);
        console.log(participant);

        if (!participant) {
            return new Response(JSON.stringify({ message: 'Participant not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ participant }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in GET route:', error.message);
        console.error(error);
        return new Response(
            JSON.stringify({ message: 'Internal Server Error', error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
