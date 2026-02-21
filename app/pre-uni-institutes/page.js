'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IoChevronBack } from "react-icons/io5";

function PreUniInstitutesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [institutes, setInstitutes] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/getData');
                if (!response.ok) {
                    throw new Error('Failed to fetch participants.');
                }
                const result = await response.json();
                const participants = result.participants || [];

                const counts = participants.reduce((acc, participant) => {
                    if (participant.solo && (participant.solo.participantType || 'uni') === 'preuni') {
                        const name = participant.solo.institutionName || 'Unknown';
                        acc[name] = (acc[name] || 0) + 1;
                    }
                    if (participant.members) {
                        participant.members.forEach((member) => {
                            if ((member.participantType || 'uni') === 'preuni') {
                                const name = member.institutionName || 'Unknown';
                                acc[name] = (acc[name] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const rows = Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ name, count }));

                if (isMounted) {
                    setInstitutes(rows);
                }
            } catch (error) {
                console.error('Error fetching pre-uni institutes:', error);
                if (isMounted) {
                    setInstitutes([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className='flex flex-col w-full min-h-screen justify-center items-center px-6 lg:px-12 text-[#eeeeee]'>
            <div className='flex flex-col w-full max-w-4xl pt-12 pb-24'>
                <div className='flex items-center justify-between mb-8'>
                    <h1 className='text-lg font-medium uppercase tracking-tight'>Pre-Uni Institutes</h1>
                    <Link
                        href="/dashboard"
                        className='rounded-md flex items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase text-[#535357] h-8 pl-2 pr-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'
                    >
                        <IoChevronBack className='inline mr-2' />
                        Back
                    </Link>
                </div>

                <div className='flex flex-col w-full containerFormat p-6'>
                    {isLoading ? (
                        <div className='text-sm text-[#c1c2c7]'>Loading...</div>
                    ) : institutes.length === 0 ? (
                        <div className='text-sm text-[#c1c2c7]'>No pre-uni registrants yet.</div>
                    ) : (
                        <div className='flex flex-col gap-3'>
                            {institutes.map((institute) => (
                                <div key={institute.name} className='flex items-center justify-between text-sm'>
                                    <div className='truncate'>{institute.name}</div>
                                    <div className='text-[#c1c2c7]'>{institute.count}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PreUniInstitutesPage;
