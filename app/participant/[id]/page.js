'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { Protect, useUser } from '@clerk/nextjs';
import ParticipantInfo from '@/components/ParticipantInfo';
import { IoChevronBack } from "react-icons/io5";
import { FiDownload, FiEdit2 } from "react-icons/fi";
import * as XLSX from 'xlsx';

function ParticipantPage() {
    const { isLoaded, user } = useUser();
    const router = useRouter();
    const { id } = useParams();
    const [participant, setParticipant] = useState(null);
    const isExco = isLoaded && user?.publicMetadata?.role === 'exco';
    const [isEditingTeamName, setIsEditingTeamName] = useState(false);
    const [draftTeamName, setDraftTeamName] = useState('');

    function handleGoBack() {
        router.push('/dashboard');
    }

    const genderMap = {
        "he": "Male",
        "she": "Female",
        "they": "Prefer not to say",
    };

    const getGenderLabel = (gender) => {
        if (typeof gender !== "string") return "";
        const normalized = gender.trim().toLowerCase();
        return genderMap[normalized] || gender;
    };

    const universityMap = {
        "Nanyang Technological University": "NTU",
        "National University of Singapore": "NUS",
        "Singapore University of Design & Technology": "SUTD",
        "Singapore University of Social Sciences": "SUSS",
        "Singapore Management University": "SMU",
        "Singapore Institute of Technology": "SIT",
        "Singapore Institute of Management": "SIM",
    };

    const participantTypeMap = {
        "uni": "University",
        "preuni": "Pre-University",
    };

    const degreeTypeMap = {
        "ug": "Undergraduate",
        "mas": "Postgraduate (Masters)",
        "phd": "Postgraduate (PhD)",
    };

    const nationalityMap = {
        "sg": "Singaporean Citizen",
        "pr": "Singapore PR",
        "int": "International",
    };

    const dietMap = {
        "na": "No Preference",
        "veg": "Vegetarian",
        "halal": "Halal",
    };

    const preUniCategoryMap = {
        "jc": "Junior College",
        "poly": "Polytechnic",
        "ite": "ITE",
        "secondary": "Secondary",
        "international": "International School",
        "other": "Other",
    };

    const schoolMap = {
        "COE": "College of Engineering (MAE, MSE, EEE, CEE)",
        "CoS": "College of Science (CCEB, SPMS, SBS, ASE)",
        "NBS": "Nanyang Business School",
        "COHASS": "College of Humanities, Arts, and Social Sciences",
        "CCDS": "College of Computing and Data Science",
    };

    const techSchools = new Set(["COE", "CoS", "CCDS"]);
    const nonTechSchools = new Set(["NBS", "COHASS"]);

    const techCourseRegex = /(computer\s*sci\w*|computing|software|data|analyt\w*|ai|artificial|machine\s*learning|ml|information|infocomm|infocom|informatics|cyber|security|cloud|iot|engineering|electrical|electronic|mechanical|mechatronic|aerospace|civil|chemical|materials|biomedical|bioengineer|bioinformatic|mathematics|statistic|physics|tech|technology|robotic|quantitative\s*finance)/i;
    const techCourseAbbrevRegex = /\b(cs|csc|ce|dsai|eee|ict|it|iem|esd|csd|bie|bcg)\b/i;
    const nonTechCourseRegex = /(business|accounting|finance|economics|marketing|management|humanities|history|linguistics|literature|psychology|sociology|political|public\s*policy|law|communications|journalism|design|arts|music|education|social\s*work|maritime\s*studies)/i;

    const normalizeParticipantType = (value) => {
        if (!value) return "";
        return participantTypeMap[value] || value;
    };

    const normalizeUniversity = (value) => {
        if (!value) return "";
        return value;
    };

    const normalizeSchool = (value) => {
        if (!value) return "";
        return schoolMap[value] || value;
    };

    const normalizePreUniCategory = (value) => {
        if (!value) return "";
        return preUniCategoryMap[value] || value;
    };

    const normalizeDegreeType = (value) => {
        if (!value) return "";
        return degreeTypeMap[value] || value;
    };

    const normalizeNationality = (value) => {
        if (!value) return "";
        return nationalityMap[value] || value;
    };

    const normalizeDiet = (value) => {
        if (!value) return "";
        return dietMap[value] || value;
    };

    const formatTimestamp = (value, fallbackId) => {
        if (value) {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed.toISOString();
            }
        }
        if (fallbackId) {
            const hex = fallbackId.toString().substring(0, 8);
            const timestamp = parseInt(hex, 16);
            if (!Number.isNaN(timestamp)) {
                return new Date(timestamp * 1000).toISOString();
            }
        }
        return "";
    };

    const getTechCategory = ({ school, course }) => {
        if (school && techSchools.has(school)) return "Tech";
        if (school && nonTechSchools.has(school)) return "Non-Tech";
        if (course && techCourseAbbrevRegex.test(course)) return "Tech";
        if (course && techCourseRegex.test(course)) return "Tech";
        if (course && nonTechCourseRegex.test(course)) return "Non-Tech";
        return "Unknown";
    };

    const downloadExcel = () => {
        if (!participant) return;

        let data = [];
        let summaryRows = [];

        const createdAt = formatTimestamp(participant.createdAt, participant._id);
        const updatedAt = formatTimestamp(participant.updatedAt, participant._id);

        const buildRow = (member, teamNameLabel) => {
            const participantTypeValue = normalizeParticipantType(member.participantType || "uni");
            const universityValue = normalizeUniversity(member.uni);
            const institutionValue = member.institutionName || "";
            const schoolValue = normalizeSchool(member.school || "");
            const degreeValue = normalizeDegreeType(member.degreeType || "");
            const nationalityValue = normalizeNationality(member.nationality || "");
            const preUniCategoryValue = normalizePreUniCategory(member.preUniCategory || "");
            const dietValue = normalizeDiet(member.diet || "");
            const techCategoryValue = getTechCategory({
                school: member.school || "",
                course: member.course || "",
            });

            return {
                "Team Name": teamNameLabel,
                "Participant Name": member.name,
                "Participant Type": participantTypeValue,
                "Tech vs Non-Tech": techCategoryValue,
                "Email": member.email,
                "Telegram Handle": member.tele,
                "University": universityValue,
                "Institution Name": institutionValue,
                "Pre-University Category": preUniCategoryValue,
                "Expected Graduation Year": member.expectedGradYear || "",
                "Date of Birth": member.dateOfBirth || "",
                "Guardian Name": member.guardianName || "",
                "Guardian Email": member.guardianEmail || "",
                "Guardian Phone": member.guardianPhone || "",
                "Guardian Consent": typeof member.guardianConsent === "boolean" ? (member.guardianConsent ? "Yes" : "No") : "",
                "Indemnity MS Form Confirmed": typeof member.indemnityMsFormConfirmed === "boolean" ? (member.indemnityMsFormConfirmed ? "Yes" : "No") : "",
                "Course / Stream / Track": member.course || "",
                "School": schoolValue,
                "Degree Type": degreeValue,
                "Year": member.year || "",
                "Nationality / Residential Status": nationalityValue,
                "Gender": getGenderLabel(member.gender),
                "Staying Overnight": member.night ? "Yes" : "No",
                "T-Shirt Size": member.size || "",
                "NTU Email": member.ntuEmail || "",
                "Matriculation Number": member.matricNo || "",
                "Dietary Preferences": dietValue,
                "Submitted At": createdAt,
                "Last Updated At": updatedAt,
            };
        };

        if (participant.solo) {
            data.push(buildRow(participant.solo, "Individual"));
        } else if (participant.members) {
            data = participant.members.map(member =>
                buildRow(member, participant.teamName || "Team")
            );
        }

        const techCounts = { "Tech": 0, "Non-Tech": 0, "Unknown": 0 };
        const summaryInput = participant.solo ? [participant.solo] : participant.members || [];

        summaryInput.forEach((member) => {
            const category = getTechCategory({
                school: member.school || "",
                course: member.course || "",
            });
            techCounts[category] = (techCounts[category] || 0) + 1;
        });

        summaryRows = [
            { "Category": "Tech", "Count": techCounts["Tech"] || 0 },
            { "Category": "Non-Tech", "Count": techCounts["Non-Tech"] || 0 },
            { "Category": "Unknown", "Count": techCounts["Unknown"] || 0 },
            { "Category": "Total", "Count": summaryInput.length },
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

        const rawFileName = participant.teamName || participant.solo.name;
        const formattedFileName = rawFileName.toLowerCase().replace(/\s+/g, "-");

        XLSX.writeFile(workbook, `${formattedFileName}.xlsx`);
    };

    const updateParticipantField = async ({ scope, memberIndex, field, value }) => {
        if (!id) return;
        try {
            const response = await fetch(`/api/getData/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scope,
                    memberIndex,
                    updates: { [field]: value },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error updating participant:', errorData.message || response.statusText);
                return;
            }

            const data = await response.json();
            setParticipant(data.participant);
        } catch (error) {
            console.error('Update error:', error.message);
        }
    };

    useEffect(() => {
        if (isEditingTeamName) return;
        setDraftTeamName(participant?.teamName || '');
    }, [participant?.teamName, isEditingTeamName]);

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

    const handleTeamNameSave = async () => {
        const nextName = draftTeamName.trim();
        if (!nextName) return;
        await updateParticipantField({
            scope: 'team',
            field: 'teamName',
            value: nextName,
        });
        setIsEditingTeamName(false);
    };

    const handleTeamNameCancel = () => {
        setIsEditingTeamName(false);
        setDraftTeamName(participant?.teamName || '');
    };

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
                    <div className='flex flex-col w-screen items-center md:items-start justify-center py-24'>
                        <div className='flex w-full items-end justify-between md:justify-start gap-4 px-12 mb-8'>
                            <button onClick={handleGoBack} className='rounded-md flex items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase text-[#535357] h-8 pl-2 pr-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'>
                                <IoChevronBack className='inline mr-2' />
                                Back
                            </button>
                            <button onClick={downloadExcel} className='rounded-md flex justify-center items-center bg-[#151518] border border-[#1f1f21] font-medium uppercase h-8 text-[#535357] px-4 py-2 hover:bg-[#222226] hover:text-slate-200 ease-in-out transition duration-200'>
                                <FiDownload className='inline ' />
                            </button>
                        </div>
                        <ParticipantInfo
                            participant={participant.solo}
                            canEdit={isExco}
                            onUpdateField={(field, value) =>
                                updateParticipantField({
                                    scope: 'solo',
                                    field,
                                    value,
                                })
                            }
                        />
                    </div>
                ) : (
                    <div className='flex flex-col w-screen items-center md:items-start md:overflow-scroll py-24'>
                        <div className='flex items-center gap-3 mb-8 md:px-12'>
                            {isEditingTeamName ? (
                                <>
                                    <input
                                        value={draftTeamName}
                                        onChange={(event) => setDraftTeamName(event.target.value)}
                                        className='bg-transparent border-b border-[#2b2b2d] text-slate-200 outline-none'
                                    />
                                    <button
                                        onClick={handleTeamNameSave}
                                        className='text-xs uppercase tracking-wide text-gray-500 hover:text-slate-200 transition duration-200 ease-in-out'
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleTeamNameCancel}
                                        className='text-xs uppercase tracking-wide text-gray-500 hover:text-slate-200 transition duration-200 ease-in-out'
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h1 className='font-medium'>{participant.teamName}</h1>
                                    {isExco && (
                                        <button
                                            onClick={() => setIsEditingTeamName(true)}
                                            className='text-[#2b2b2d] hover:text-slate-200 transition duration-200 ease-in-out'
                                            aria-label='Edit team name'
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
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
                                <ParticipantInfo
                                    participant={member}
                                    canEdit={isExco}
                                    onUpdateField={(field, value) =>
                                        updateParticipantField({
                                            scope: 'member',
                                            memberIndex: index,
                                            field,
                                            value,
                                        })
                                    }
                                />
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
