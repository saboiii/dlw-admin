'use client'
import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { Protect } from '@clerk/nextjs'

function Dashboard() {
    const { isLoaded, user } = useUser();
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        numberOfTeams: 0,
        numberOfSoloMembers: 0,
        totalParticipants: 0,
        studentsByUniversity: {},
        genderCounts: {}
    });

    useEffect(() => {
        if (isLoaded && user) {
            fetch('/api/getData')
                .then((response) => response.json())
                .then((result) => {
                    const participants = result.participants;
                    setData(participants);

                    const numberOfTeams = participants.filter(p => p.teamName && p.members?.length > 0).length;
                    const numberOfSoloMembers = participants.filter(p => p.solo).length;

                    const totalParticipants = participants.reduce((total, p) => {
                        const teamMembers = p.members?.length || 0;
                        const soloMember = p.solo ? 1 : 0;
                        return total + teamMembers + soloMember;
                    }, 0);

                    const studentsByUniversity = participants.reduce((acc, p) => {
                        if (p.solo) {
                            acc[p.solo.uni] = (acc[p.solo.uni] || 0) + 1;
                        }
                        if (p.members) {
                            p.members.forEach(member => {
                                acc[member.uni] = (acc[member.uni] || 0) + 1;
                            });
                        }
                        return acc;
                    }, {});

                    const genderCounts = participants.reduce((acc, p) => {
                        if (p.solo) {
                            acc[p.solo.gender] = (acc[p.solo.gender] || 0) + 1;
                        }
                        if (p.members) {
                            p.members.forEach(member => {
                                acc[member.gender] = (acc[member.gender] || 0) + 1;
                            });
                        }
                        return acc;
                    }, {});

                    setStats({ numberOfTeams, numberOfSoloMembers, totalParticipants, studentsByUniversity, genderCounts });
                })
                .catch((error) => console.error('Error fetching participants:', error));
        }
    }, [isLoaded, user]);


    return (
        <Protect
            fallback={<div className='flex flex-col w-full h-screen justify-center items-center'>Please sign in.</div>}
        >
            <div className='flex flex-col w-full md:h-screen justify-center items-center px-6 md:px-12 py-10'>
                <div className='flex flex-col w-full md:h-full'>
                    <h1 className='ml-2 flex items-center h-[20vh]  md:h-[20%]'>
                        Welcome, {user?.firstName}.
                    </h1>
                    <div className='grid md:h-[80%] grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 w-full'>
                        <div className='flex flex-col w-full md:col-span-2 md:row-span-2 md:h-full h-[50vh] containerFormat p-4'>
                            <div className='flex flex-col w-full divide-y divide-[#1f1f21] overflow-scroll'>
                                {data.map((participant) => (
                                    <div key={participant._id}>
                                        {participant.solo ? (
                                            <div className="flex justify-start gap-4 items-center px-6 w-full h-10">
                                                <div className="flex soloStyle">Solo</div>
                                                <div className="flex soloStyleSoft truncate">{participant.solo.name}</div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-start gap-4 px-6 w-full h-10">
                                                <div className="flex teamStyle">Team</div>
                                                <div className="flex teamStyleSoft truncate">{participant.teamName} {participant.members && ` (${participant.members.length} members)`}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='flex w-full md:col-span-1 md:row-span-2 h-full containerFormat p-4'>
                            <div className='flex flex-col w-full divide-y divide-[#1f1f21] overflow-scroll'>
                                <div className="flex items-center px-6 w-full py-3">
                                    Number of Teams: {stats.numberOfTeams}
                                </div>
                                <div className="flex items-center px-6 w-full py-3">
                                    Number of Solo Members: {stats.numberOfSoloMembers}
                                </div>
                                <div className="flex items-center px-6 w-full py-3">
                                    Total Participants: {stats.totalParticipants}
                                </div>
                                <div className="flex py-4 px-4 w-full flex-col">
                                    {Object.entries(stats.studentsByUniversity).map(([uni, count]) => {

                                        const universityMap = {
                                            "Nanyang Technological University": "NTU",
                                            "National University of Singapore": "NUS",
                                            "Singapore University of Design & Technology": "SUTD",
                                            "Singapore University of Social Sciences": "SUSS",
                                            "Singapore Management University": "SMU",
                                            "Singapore Institute of Technology": "SIT"
                                        };

                                        const shortForm = universityMap[uni];

                                        return (
                                            <div key={uni} className="flex rounded-xl bg-[#0e0e10] px-4 py-2 mb-2">
                                                {shortForm}: {count}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex py-4 px-4 w-full flex-col">
                                    {Object.entries(stats.genderCounts).map(([gender, count]) => {
                                        const genderMap = {
                                            "he": "Male",
                                            "she": "Female",
                                            "they": "Prefer not to say"
                                        };

                                        const genderLabel = genderMap[gender];

                                        return (
                                            <div key={gender} className="flex rounded-xl bg-[#0e0e10] px-4 py-2 mb-2">
                                                {genderLabel}: {count}
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                        {/* <div className='flex w-full md:col-span-2 md:row-span-1 h-full containerFormat'>

                        </div>
                        <div className='flex w-full md:col-span-1 md:row-span-1 h-full containerFormat'>

                        </div> */}
                    </div>
                </div>
            </div>
        </Protect>
    )
}

export default Dashboard