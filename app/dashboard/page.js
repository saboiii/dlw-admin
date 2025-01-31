'use client'
import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { Protect } from '@clerk/nextjs'
import { LuRefreshCcw } from "react-icons/lu";
import Alert from '@/components/Alert';
import Message from '@/components/Message';
import { useRouter } from 'next/navigation';
import { FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';

function Dashboard() {
    const router = useRouter();
    const { isLoaded, user } = useUser();
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        numberOfTeams: 0,
        numberOfSoloMembers: 0,
        totalParticipants: 0,
        studentsByUniversity: {},
        genderCounts: {}
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [participantToDelete, setParticipantToDelete] = useState(null);
    const [participantNameToDelete, setNameParticipantToDelete] = useState('');
    const [alert, setAlert] = useState(false);
    const [successDeleteMessage, setSuccessDeleteMessage] = useState(false);

    const genderMap = {
        "he": "Male",
        "she": "Female",
        "they": "Prefer not to say",
    };

    const universityMap = {
        "Nanyang Technological University": "NTU",
        "National University of Singapore": "NUS",
        "Singapore University of Design & Technology": "SUTD",
        "Singapore University of Social Sciences": "SUSS",
        "Singapore Management University": "SMU",
        "Singapore Institute of Technology": "SIT",
    };

    function openAlert() {
        setAlert(true);
    }

    function closeAlert() {
        setAlert(false);
    }

    function startDelete(id, name) {
        setParticipantToDelete(id);
        setNameParticipantToDelete(name);
        openAlert();
    }

    function handleView(id) {
        router.push(`/participant/${id}`);
    }

    const handleDelete = async (id) => {
        try {
            setIsDeleting(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            const response = await fetch(`/api/deleteData`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete participant.');
            }

            setData((prevData) => prevData.filter((participant) => participant._id !== id));
            setSuccessDeleteMessage(true);
        } catch (error) {
            console.error('Error deleting participant:', error);
        } finally {
            closeAlert();
            setIsDeleting(false);
        }
    };

    const fetchData = async () => {
        setIsRefreshing(true);
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
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
            .catch((error) => console.error('Error fetching participants:', error))
            .finally(() => {
                closeAlert();
                setIsRefreshing(false);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (isLoaded && user) {
            fetchData();
        }
    }, [isLoaded, user]);

    const ShimmerPlaceholder = () => (
        <div className="animate-pulse">
            <div className="h-6 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 bg-zinc-800 rounded"></div>
        </div>
    );

    const downloadData = () => {
        if (!data || data.length === 0) return;

        const allParticipants = data.flatMap(participant => {
            if (participant.solo) {
                return {
                    Name: participant.solo.name,
                    Email: participant.solo.email,
                    Telegram: participant.solo.tele,
                    University: universityMap[participant.solo.uni],
                    Gender: genderMap[participant.solo.gender],
                    Night_Stay: participant.solo.night ? "Yes" : "No",
                    Size: participant.solo.size,
                    NTU_Email: participant.solo.ntuEmail || "",
                    Matric_No: participant.solo.matricNo || "",
                };
            } else if (participant.members) {
                return participant.members.map(member => ({
                    Name: member.name,
                    Email: member.email,
                    Telegram: member.tele,
                    University: universityMap[member.uni],
                    Gender: genderMap[member.gender],
                    Night_Stay: member.night ? "Yes" : "No",
                    Size: member.size,
                    NTU_Email: member.ntuEmail || "",
                    Matric_No: member.matricNo || "", 
                }));
            }
            return [];
        });

        const worksheet = XLSX.utils.json_to_sheet(allParticipants);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

        const rawFileName = "dlw_participants"; 
        const formattedFileName = rawFileName.toLowerCase().replace(/\s+/g, "-");

        XLSX.writeFile(workbook, `${formattedFileName}.xlsx`);
    };


    return (
        <Protect
            fallback={<div className='bg-black text-[#eeeeee] flex flex-col w-full h-screen justify-center items-center'>Please sign in.</div>}
        >
            <div className='flex flex-col w-full md:h-screen justify-center items-center px-6 md:px-12 py-10 bg-black'>
                {successDeleteMessage && <Message />}
                <Alert
                    title={`Delete ${participantNameToDelete}`}
                    description={'Are you sure? This action is irreversible!'}
                    continueFunction={() => handleDelete(participantToDelete)}
                    flag={isDeleting}
                    alert={alert}
                    continueText={"Delete"}
                    handleAlert={closeAlert}
                />
                <div className='flex flex-col w-full md:h-full'>
                    <div className='ml-2 mb-8 h-[20vh] md:h-[25%] items-start flex flex-col justify-end'>
                        <h1 className='flex mb-4 md:mb-6'>
                            Welcome, {user?.firstName}.
                        </h1>
                        <div className='flex md:text-sm w-[60vw] text-[#eeeeee]'>
                            Here, you can manage participant data and access key insights.
                        </div>
                    </div>
                    <div className='grid md:h-[75%] grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-8 md:gap-4 w-full'>
                        <div className='flex flex-col w-full md:col-span-2 md:row-span-2 md:h-full h-[50vh] containerFormat p-4'>
                            <div className='flex text-[#c1c2c7] text-lg ml-2 py-2 font-medium uppercase tracking-tight mb-4'>List of Participants</div>
                            <button
                                onClick={fetchData}
                                disabled={isRefreshing}
                                className={`flex items-center mb-4 uppercase buttonDesign2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <LuRefreshCcw
                                    size={12}
                                    className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                Refresh
                            </button>
                            <button onClick={downloadData} className='flex items-center mb-4 uppercase buttonDesign2'>
                                <FiDownload className='inline mr-2' />
                                Download
                            </button>
                            <div className='flex flex-col w-full divide-y divide-[#1f1f21] overflow-scroll'>
                                {isLoading ? (
                                    <ShimmerPlaceholder />
                                ) : (
                                    data.map((participant) => (
                                        <div key={participant._id}>
                                            {participant.solo ? (
                                                <div className="flex items-center justify-between px-6 my-2 w-full h-10">
                                                    <div className='flex gap-4'>
                                                        <div className="flex soloStyle">Solo</div>
                                                        <div className="block soloStyleSoft  w-[60px] md:w-[150px] lg:w-[200px] truncate">{participant.solo.name}</div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleView(participant._id)}
                                                            className='flex viewButton'>
                                                            View
                                                        </button>
                                                        {/* <button
                                                            onClick={() => startDelete(participant._id, participant.solo.name)}
                                                            className='flex deleteButton2'>
                                                            Delete
                                                        </button> */}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between px-6 my-2 w-full h-10">
                                                    <div className='flex gap-4'>
                                                        <div className="flex teamStyle">Team</div>
                                                        <div className="block teamStyleSoft w-[60px] md:w-[150px] lg:w-[200px] truncate">
                                                            {participant.teamName} {participant.members && ` (${participant.members.length} pax)`}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleView(participant._id)}
                                                            className='flex viewButton'>
                                                            View
                                                        </button>
                                                        {/* <button
                                                            onClick={() => startDelete(participant._id, participant.teamName)}
                                                            className='flex deleteButton2'>
                                                            Delete
                                                        </button> */}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className='flex w-full md:col-span-1 md:row-span-2 h-full text-[#eeeeee] containerFormat p-4'>
                            <div className='flex flex-col w-full divide-y divide-[#1f1f21] overflow-scroll'>
                                {isLoading ? (
                                    <ShimmerPlaceholder />
                                ) : (
                                    <>
                                        <div className="flex items-center px-6 w-full py-3">
                                            Number of Teams: {stats.numberOfTeams}
                                        </div>
                                        <div className="flex items-center px-6 w-full py-3">
                                            Number of Solo Members: {stats.numberOfSoloMembers}
                                        </div>
                                        <div className="flex items-center px-6 w-full py-3">
                                            Total Participants: {stats.totalParticipants}
                                        </div>
                                    </>
                                )}
                                <div className="flex py-4 px-4 w-full flex-col">
                                    {isLoading ? (
                                        <div className="animate-pulse space-y-4">
                                            {[...Array(3)].map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="flex rounded-xl bg-[#1f1f21] h-6 w-full px-4 py-2 mb-2"
                                                />
                                            ))}
                                        </div>
                                    ) : (

                                        Object.entries(stats.studentsByUniversity).map(([uni, count]) => {
                                            return (
                                                <div
                                                    key={uni}
                                                    className="flex rounded-xl bg-[#0e0e10] px-4 py-2 mb-2"
                                                >
                                                    {universityMap[uni]}: {count}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>


                                <div className="flex py-4 px-4 w-full flex-col">
                                    {isLoading ? (
                                        <div className="animate-pulse space-y-4">
                                            {[...Array(3)].map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="flex rounded-xl bg-[#1f1f21] h-6 w-full px-4 py-2 mb-2"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        Object.entries(stats.genderCounts).map(([gender, count]) => {
                                            return (
                                                <div
                                                    key={gender}
                                                    className="flex rounded-xl bg-[#0e0e10] px-4 py-2 mb-2"
                                                >
                                                    {genderMap[gender]}: {count}
                                                </div>
                                            );
                                        })
                                    )}
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