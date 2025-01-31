import React from 'react'
import { IoMdCopy } from "react-icons/io";

function ParticipantInfo({ participant }) {

    const universityMap = {
        "Nanyang Technological University": "NTU",
        "National University of Singapore": "NUS",
        "Singapore University of Design & Technology": "SUTD",
        "Singapore University of Social Sciences": "SUSS",
        "Singapore Management University": "SMU",
        "Singapore Institute of Technology": "SIT",
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    const genderMap = {
        "he": "Male",
        "she": "Female",
        "they": "Prefer not to say",
    };

    return (
        <div className='flex flex-col justify-center w-full gap-4 h-full px-12 py-32 md:p-24'>
            <h1 className='flex mb-4'>{participant.solo.name}</h1>
            <div className='flex flex-wrap gap-4 mb-4'>
                <div className='bg-gradient-to-r from-[#874462] to-[#965a75] infoTag'>Solo</div>
                <div className='bg-gradient-to-r from-[#448785] to-[#3f6c6b] infoTag'>{universityMap[participant.solo.uni]}</div>
                <div className='bg-gradient-to-r from-[#a9654c] to-[#c86f52] infoTag'>Size {participant.solo.size}</div>
                <div className='bg-gradient-to-r from-[#5f4487] to-[#7e63a7] infoTag '>{genderMap[participant.solo.gender]}</div>
                <div className={`bg-gradient-to-r ${participant.solo.night ? 'from-[#423b77] to-[#2d2669]':'from-[#7f2d2d] to-[#c65247]'} infoTag`}>{participant.solo.night ? 'Staying Overnight':'Not Staying Overnight'}</div>
            </div>

            <div className='flex flex-col gap-2 w-full'>
                <div className='flex ml-1 uppercase font-medium text-gray-600'>Personal Email</div>
                <div className='flex w-full md:w-2/3 containerFormat text-slate-200  transition duration-200 ease-in-out justify-between'>
                    <div className='flex px-4 py-2'>{participant.solo.email}</div>
                    <button onClick={() => handleCopy(participant.solo.email)} className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10 h-full'>
                        <IoMdCopy size={16} className='flex' />
                    </button>
                </div>
            </div>

            {participant.solo.ntuEmail && (
                <div className='flex flex-col gap-2 w-full'>
                    <div className='flex ml-1 uppercase font-medium text-gray-600'>NTU Email</div>
                    <div className='flex w-full md:w-2/3 containerFormat text-slate-200  transition duration-200 ease-in-out justify-between'>
                        <div className='flex px-4 py-2'>{participant.solo.ntuEmail}</div>
                        <button onClick={() => handleCopy(participant.solo.ntuEmail)} className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10 h-full'>
                            <IoMdCopy size={16} className='flex' />
                        </button>
                    </div>
                </div>
            )}

            {participant.solo.matricNo && (
                <div className='flex flex-col gap-2 w-full'>
                    <div className='flex ml-1 uppercase font-medium text-gray-600'>Matriculation No.</div>
                    <div className='flex w-full md:w-2/3 containerFormat text-slate-200  transition duration-200 ease-in-out justify-between'>
                        <div className='flex px-4 py-2'>{participant.solo.matricNo}</div>
                        <button onClick={() => handleCopy(participant.solo.matricNo)} className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10 h-full'>
                            <IoMdCopy size={16} className='flex' />
                        </button>
                    </div>
                </div>
            )}

            <div className='flex flex-col gap-2 w-full'>
                <div className='flex ml-1 uppercase font-medium text-gray-600'>Telegram</div>
                <div className='flex w-full md:w-2/3 containerFormat text-slate-200 justify-between'>
                    <div className='flex px-4 py-2'>{participant.solo.tele}</div>
                    <button onClick={() => handleCopy(participant.solo.tele)} className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10 h-full'>
                        <IoMdCopy size={16} className='flex' />
                    </button>
                </div>
            </div>

            <div className='flex flex-col gap-2 w-full'>
                <div className='flex ml-1 uppercase font-medium text-gray-600'>Course</div>
                <div className='flex w-full md:w-2/3 containerFormat text-slate-200 justify-between'>
                    <div className='flex px-4 py-2'>{participant.solo.course}</div>
                    <button onClick={() => handleCopy(participant.solo.course)} className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10 h-full'>
                        <IoMdCopy size={16} className='flex' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ParticipantInfo