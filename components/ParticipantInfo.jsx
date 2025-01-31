import React from 'react'

import CopyField from './CopyField';

function ParticipantInfo({ participant }) {

    const universityMap = {
        "Nanyang Technological University": "NTU",
        "National University of Singapore": "NUS",
        "Singapore University of Design & Technology": "SUTD",
        "Singapore University of Social Sciences": "SUSS",
        "Singapore Management University": "SMU",
        "Singapore Institute of Technology": "SIT",
    };



    const genderMap = {
        "he": "Male",
        "she": "Female",
        "they": "Prefer not to say",
    };

    return (
        <div className='flex flex-col justify-center w-full gap-4 px-12 '>
            <h2 className='flex mb-4 font-normal'>{participant.name}</h2>
            <div className='flex flex-wrap gap-4 mb-4'>
                <div className='bg-gradient-to-r from-[#874462] to-[#965a75] infoTag'>Solo</div>
                <div className='bg-gradient-to-r from-[#448785] to-[#3f6c6b] infoTag'>{universityMap[participant.uni]}</div>
                <div className='bg-gradient-to-r from-[#a9654c] to-[#c86f52] infoTag'>Size {participant.size}</div>
                <div className='bg-gradient-to-r from-[#5f4487] to-[#7e63a7] infoTag '>{genderMap[participant.gender]}</div>
                <div className={`bg-gradient-to-r ${participant.night ? 'from-[#423b77] to-[#2d2669]' : 'from-[#7f2d2d] to-[#c65247]'} infoTag`}>{participant.night ? 'Staying Overnight' : 'Not Staying Overnight'}</div>
            </div>

            <CopyField content={participant.email} title={'Personal Email'} />

            {participant.ntuEmail && (
                <CopyField content={participant.ntuEmail} title={'NTU Email'} />
            )}

            {participant.matricNo && (
                <CopyField content={participant.matricNo} title={'Matriculation No.'} />
            )}

            <CopyField content={participant.tele} title={'Telegram Handle'} />

            <CopyField content={participant.course} title={'Course'}/>
        </div>
    )
}

export default ParticipantInfo