'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { Protect, useUser } from '@clerk/nextjs';
import ParticipantInfo from '@/components/ParticipantInfo';
import { IoChevronBack } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';

function ParticipantPage() {
    const { isLoaded, user } = useUser();
    const router = useRouter();
    const { id } = useParams();
    const [participant, setParticipant] = useState(null);

    function handleGoBack() {
        router.push('/dashboard');
    }

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

    const downloadExcel = () => {
        if (!participant) return;

        let data = [];

        if (participant.solo) {
            data.push({
                Name: participant.solo.name,
                Email: participant.solo.email,
                Telegram: participant.solo.tele,
                University: universityMap[participant.solo.uni],
                Course: participant.solo.course,
                Gender: genderMap[participant.solo.gender],
                Night_Stay: participant.solo.night ? "Yes" : "No",
                Size: participant.solo.size,
                NTU_Email: participant.solo.ntuEmail || "",
                Matric_No: participant.solo.matricNo || "",
                Dietary_Preferences: participant.solo.diet || "",
            });
        } else if (participant.members) {
            data = participant.members.map(member => ({
                Name: member.name,
                Email: member.email,
                Telegram: member.tele,
                University: universityMap[member.uni],
                Course: member.course,
                Gender: genderMap[member.gender],
                Night_Stay: member.night ? "Yes" : "No",
                Size: member.size,
                NTU_Email: member.ntuEmail || "",
                Matric_No: member.matricNo || "",
                Dietary_Preferences: member.diet || "",
            }));
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

        const rawFileName = participant.teamName || participant.solo.name;
        const formattedFileName = rawFileName.toLowerCase().replace(/\s+/g, "-");

        XLSX.writeFile(workbook, `${formattedFileName}.xlsx`);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/getData/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setParticipant(data.participant);
                    console.log(data.participant);
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
            <div className="flex flex-col w-full h-screen justify-center items-center text-[#eeeeee]">
                <p>Loading...</p>
            </div>
        );
    }


    return (
        <Protect
            fallback={<div className='flex flex-col w-full justify-center items-center text-[#eeeeee]'>Please sign in.</div>}
        >
            <div className='flex flex-col items-center justify-center w-screen text-[#eeeeee]'>

                {participant.solo ? (
                    <div className='flex flex-col h-screen w-screen items-center md:items-start justify-center '>
                        <div className='flex w-full items-end justify-between md:justify-start gap-4 px-12 mb-8'>
                            <button onClick={handleGoBack} className='rounded-md flex items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase text-[#535357] h-8 pl-2 pr-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'>
                                <IoChevronBack className='inline mr-2' />
                                Back
                            </button>
                            <button onClick={downloadExcel} className='rounded-md flex justify-center items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase h-8 text-[#535357] px-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'>
                                <FiDownload className='inline ' />
                            </button>
                        </div>
                        <ParticipantInfo participant={participant.solo} />
                    </div>
                ) : (
                    <div className='flex flex-col pt-32 w-screen items-center md:items-start md:h-screen md:overflow-scroll'>
                        <h1 className='font-medium mb-8 md:px-12'>{participant.teamName}</h1>
                        <div className='w-full flex justify-between md:justify-start gap-4 mb-6 px-12 '>
                            <button onClick={handleGoBack} className='rounded-md flex items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase text-[#535357] pl-2 pr-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'>
                                <IoChevronBack className='inline mr-2' />
                                Back
                            </button>
                            <button onClick={downloadExcel} className='rounded-md flex justify-center items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase text-[#535357] px-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'>
                                Download
                                <FiDownload className='inline ml-2' />
                            </button>
                        </div>
                        <div className='flex w-full border-[#2b2b2d] border-t mb-8' />
                        {participant.members.map((member, index) => (
                            <div key={index} className='flex w-full flex-col'>
                                <ParticipantInfo participant={member} />
                                <div className='flex w-full border-[#2b2b2d] border-t my-10' />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Protect>
    )
}

export default ParticipantPage;
