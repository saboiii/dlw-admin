import connectDB from '@/lib/db';
import Participant from '@/models/participant';
import { currentUser } from '@clerk/nextjs/server';

connectDB();

export async function GET(req, { params }) {
    const { id } = await params;

    try {

        const participant = await Participant.findById(id);

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

const ALLOWED_MEMBER_FIELDS = new Set([
    'name',
    'participantType',
    'uni',
    'institutionName',
    'preUniCategory',
    'expectedGradYear',
    'dateOfBirth',
    'guardianName',
    'guardianEmail',
    'guardianPhone',
    'guardianConsent',
    'indemnityMsFormConfirmed',
    'matricNo',
    'ntuEmail',
    'email',
    'gender',
    'tele',
    'course',
    'school',
    'degreeType',
    'year',
    'nationality',
    'diet',
    'size',
    'night',
]);

const ALLOWED_TEAM_FIELDS = new Set([
    'teamName',
]);

export async function PATCH(req, { params }) {
    const { id } = await params;

    try {
        const user = await currentUser();

        if (!user) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const role = user.publicMetadata?.role;
        if (role !== 'exco') {
            return new Response(JSON.stringify({ message: 'Forbidden: Exco members only' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { scope, memberIndex, updates } = await req.json();

        if (!updates || typeof updates !== 'object') {
            return new Response(JSON.stringify({ message: 'Updates payload is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateDoc = {};

        if (scope === 'solo') {
            const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (ALLOWED_MEMBER_FIELDS.has(key)) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            if (Object.keys(sanitizedUpdates).length === 0) {
                return new Response(JSON.stringify({ message: 'No valid fields to update' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            Object.entries(sanitizedUpdates).forEach(([key, value]) => {
                updateDoc[`solo.${key}`] = value;
            });
        } else if (scope === 'member') {
            if (typeof memberIndex !== 'number' || memberIndex < 0) {
                return new Response(JSON.stringify({ message: 'Valid memberIndex is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (ALLOWED_MEMBER_FIELDS.has(key)) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            if (Object.keys(sanitizedUpdates).length === 0) {
                return new Response(JSON.stringify({ message: 'No valid fields to update' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            Object.entries(sanitizedUpdates).forEach(([key, value]) => {
                updateDoc[`members.${memberIndex}.${key}`] = value;
            });
        } else if (scope === 'team') {
            const teamUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (ALLOWED_TEAM_FIELDS.has(key)) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            if (Object.keys(teamUpdates).length === 0) {
                return new Response(JSON.stringify({ message: 'No valid team fields to update' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            Object.entries(teamUpdates).forEach(([key, value]) => {
                updateDoc[key] = value;
            });
        } else {
            return new Response(JSON.stringify({ message: 'Invalid scope' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const participant = await Participant.findByIdAndUpdate(
            id,
            { $set: updateDoc },
            { new: true, runValidators: true }
        );

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
        console.error('Error in PATCH route:', error.message);
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
