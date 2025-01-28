'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import { Protect, useUser } from '@clerk/nextjs';

function ParticipantPage() {
    const { isLoaded, user } = useUser();
    const { id } = useParams();
    const [participant, setParticipant] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/getData/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setParticipant(data.participant);
                    console.log(data);
                } else {
                    console.error('Error fetching participant:', response.statusText);
                }
            } catch (error) {
                console.error('Fetch error:', error.message);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    if (!participant) {
        return (
            <div className="flex flex-col w-full h-screen justify-center items-center bg-black text-[#eeeeee]">
                <p>Loading...</p> {/* Show loading until data is available */}
            </div>
        );
    }

    return (
        <Protect
            fallback={<div className='flex flex-col w-full h-screen justify-center items-center bg-black text-[#eeeeee]'>Please sign in.</div>}
        >
            <div className='flex flex-col items-center justify-center w-screen h-screen bg-black text-[#eeeeee]'>
                {participant.solo ? (
                    <div className='flex flex-col gap-8 items-center'>
                        <h1>{participant.solo.name}</h1>
                        <p>Webpage still under development.</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-8 items-center'>
                        <h1>{participant.teamName}</h1>
                        <p>Webpage still under development.</p>
                    </div>
                )}
            </div>
        </Protect>
    )
}

export default ParticipantPage;
