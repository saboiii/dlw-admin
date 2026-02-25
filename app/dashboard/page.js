'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { useUser, Protect } from "@clerk/nextjs";
import { LuRefreshCcw } from "react-icons/lu";
import Alert from '@/components/Alert';
import Message from '@/components/Message';
import { FiChevronsRight, FiDownload, FiTrash2 } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function Dashboard() {
    const { isLoaded, user } = useUser();
    const isExco = user?.publicMetadata?.role === 'exco';
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        numberOfTeams: 0,
        numberOfSoloMembers: 0,
        totalParticipants: 0,
        studentsByUniversity: {},
        genderCounts: {},
        schoolCounts: {},
        degreeTypeCounts: {},
        yearCounts: {},
        nationalityCounts: {},
        preUniInstituteCounts: {}
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [participantToDelete, setParticipantToDelete] = useState(null);
    const [participantNameToDelete, setNameParticipantToDelete] = useState('');
    const [alert, setAlert] = useState(false);
    const [successDeleteMessage, setSuccessDeleteMessage] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
        "Singapore Institute of Management": "SIM",
    };

    const participantTypeMap = {
        "uni": "University",
        "preuni": "Pre-Uni",
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

    const preUniLabel = "Pre-Uni";

    const getRegistrationTime = (participant) => {
        if (participant?.createdAt) {
            const time = Date.parse(participant.createdAt);
            if (!Number.isNaN(time)) return time;
        }
        if (participant?._id) {
            const hex = participant._id.toString().substring(0, 8);
            const timestamp = parseInt(hex, 16);
            if (!Number.isNaN(timestamp)) return timestamp * 1000;
        }
        return 0;
    };

    const isValidGender = (gender) => {
        if (typeof gender !== "string") return false;
        const normalized = gender.trim().toLowerCase();
        return normalized && normalized !== "na" && normalized !== "n/a";
    };

    const getGenderLabel = (gender) => {
        if (typeof gender !== "string") return "";
        const normalized = gender.trim().toLowerCase();
        return genderMap[normalized] || gender;
    };

    const normalizeParticipantType = (value) => {
        if (!value) return "";
        return participantTypeMap[value] || value;
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

    const getTechCategory = ({ school, course }) => {
        if (school && techSchools.has(school)) return "Tech";
        if (school && nonTechSchools.has(school)) return "Non-Tech";
        if (course && techCourseAbbrevRegex.test(course)) return "Tech";
        if (course && techCourseRegex.test(course)) return "Tech";
        if (course && nonTechCourseRegex.test(course)) return "Non-Tech";
        return "Unknown";
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
        window.open(`/participant/${id}`, "_blank");
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
                const sortedParticipants = [...participants].sort(
                    (a, b) => getRegistrationTime(b) - getRegistrationTime(a)
                );
                setData(sortedParticipants);

                const numberOfTeams = participants.filter(p => p.teamName && p.members?.length > 0).length;
                const numberOfSoloMembers = participants.filter(p => p.solo).length;

                const totalParticipants = participants.reduce((total, p) => {
                    const teamMembers = p.members?.length || 0;
                    const soloMember = p.solo ? 1 : 0;
                    return total + teamMembers + soloMember;
                }, 0);

                const studentsByUniversity = participants.reduce((acc, p) => {
                    if (p.solo) {
                        const type = p.solo.participantType || "uni";
                        if (type === "preuni") {
                            acc[preUniLabel] = (acc[preUniLabel] || 0) + 1;
                        } else if (p.solo.uni) {
                            acc[p.solo.uni] = (acc[p.solo.uni] || 0) + 1;
                        }
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            const type = member.participantType || "uni";
                            if (type === "preuni") {
                                acc[preUniLabel] = (acc[preUniLabel] || 0) + 1;
                            } else if (member.uni) {
                                acc[member.uni] = (acc[member.uni] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const genderCounts = participants.reduce((acc, p) => {
                    if (p.solo && isValidGender(p.solo.gender)) {
                        const genderKey = p.solo.gender.trim().toLowerCase();
                        acc[genderKey] = (acc[genderKey] || 0) + 1;
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            if (isValidGender(member.gender)) {
                                const genderKey = member.gender.trim().toLowerCase();
                                acc[genderKey] = (acc[genderKey] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const schoolCounts = participants.reduce((acc, p) => {
                    if (p.solo && p.solo.school) {
                        acc[p.solo.school] = (acc[p.solo.school] || 0) + 1;
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            if (member.school) {
                                acc[member.school] = (acc[member.school] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const degreeTypeCounts = participants.reduce((acc, p) => {
                    if (p.solo && p.solo.degreeType) {
                        acc[p.solo.degreeType] = (acc[p.solo.degreeType] || 0) + 1;
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            if (member.degreeType) {
                                acc[member.degreeType] = (acc[member.degreeType] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const yearCounts = participants.reduce((acc, p) => {
                    if (p.solo && p.solo.year) {
                        acc[p.solo.year] = (acc[p.solo.year] || 0) + 1;
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            if (member.year) {
                                acc[member.year] = (acc[member.year] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const nationalityCounts = participants.reduce((acc, p) => {
                    if (p.solo && p.solo.nationality) {
                        acc[p.solo.nationality] = (acc[p.solo.nationality] || 0) + 1;
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            if (member.nationality) {
                                acc[member.nationality] = (acc[member.nationality] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                const preUniInstituteCounts = participants.reduce((acc, p) => {
                    if (p.solo && (p.solo.participantType || "uni") === "preuni") {
                        const name = p.solo.institutionName || "Unknown";
                        acc[name] = (acc[name] || 0) + 1;
                    }
                    if (p.members) {
                        p.members.forEach(member => {
                            if ((member.participantType || "uni") === "preuni") {
                                const name = member.institutionName || "Unknown";
                                acc[name] = (acc[name] || 0) + 1;
                            }
                        });
                    }
                    return acc;
                }, {});

                setStats({ numberOfTeams, numberOfSoloMembers, totalParticipants, studentsByUniversity, genderCounts, schoolCounts, degreeTypeCounts, yearCounts, nationalityCounts, preUniInstituteCounts });
            })
            .catch((error) => console.error('Error fetching participants:', error))
            .finally(() => {
                closeAlert();
                setIsRefreshing(false);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = data.filter((participant) => {
        const searchLower = searchQuery.toLowerCase();

        if (participant.teamName && participant.teamName.toLowerCase().includes(searchLower)) {
            return true;
        }

        if (participant.solo) {
            return (
                participant.solo.name.toLowerCase().includes(searchLower) ||
                participant.solo.email.toLowerCase().includes(searchLower) ||
                participant.solo.tele.toLowerCase().includes(searchLower) ||
                universityMap[participant.solo.uni]?.toLowerCase().includes(searchLower) ||
                participant.solo.institutionName?.toLowerCase().includes(searchLower)
            );
        }

        if (participant.members) {
            return participant.members.some((member) =>
                member.name.toLowerCase().includes(searchLower) ||
                member.email.toLowerCase().includes(searchLower) ||
                member.tele.toLowerCase().includes(searchLower) ||
                universityMap[member.uni]?.toLowerCase().includes(searchLower) ||
                member.institutionName?.toLowerCase().includes(searchLower)
            );
        }

        return false;
    });


    const ShimmerPlaceholder = () => (
        <div className="animate-pulse w-full">
            <div className="h-6 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 bg-zinc-800 rounded"></div>
        </div>
    );






    const downloadData = () => {
        if (!data || data.length === 0) return;

        const allParticipants = data.flatMap(participant => {
            const createdAt = formatTimestamp(participant.createdAt, participant._id);
            const updatedAt = formatTimestamp(participant.updatedAt, participant._id);

            const buildRow = (member, teamNameLabel) => {
                const techCategoryValue = getTechCategory({
                    school: member.school || "",
                    course: member.course || "",
                });

                return {
                    "Team Name": teamNameLabel,
                    "Participant Name": member.name,
                    "Participant Type": normalizeParticipantType(member.participantType || "uni"),
                    "Tech vs Non-Tech": techCategoryValue,
                    "Email": member.email,
                    "Telegram Handle": member.tele,
                    "University": member.uni ? (universityMap[member.uni] || member.uni) : "",
                    "Institution Name": member.institutionName || "",
                    "Pre-University Category": normalizePreUniCategory(member.preUniCategory || ""),
                    "Expected Graduation Year": member.expectedGradYear || "",
                    "Date of Birth": member.dateOfBirth || "",
                    "Guardian Name": member.guardianName || "",
                    "Guardian Email": member.guardianEmail || "",
                    "Guardian Phone": member.guardianPhone || "",
                    "Guardian Consent": typeof member.guardianConsent === "boolean" ? (member.guardianConsent ? "Yes" : "No") : "",
                    "Indemnity MS Form Confirmed": typeof member.indemnityMsFormConfirmed === "boolean" ? (member.indemnityMsFormConfirmed ? "Yes" : "No") : "",
                    "Course / Stream / Track": member.course || "",
                    "School": normalizeSchool(member.school || ""),
                    "Degree Type": normalizeDegreeType(member.degreeType || ""),
                    "Year": member.year || "",
                    "Nationality / Residential Status": normalizeNationality(member.nationality || ""),
                    "Gender": getGenderLabel(member.gender),
                    "Staying Overnight": member.night ? "Yes" : "No",
                    "T-Shirt Size": member.size || "",
                    "NTU Email": member.ntuEmail || "",
                    "Matriculation Number": member.matricNo || "",
                    "Dietary Preferences": normalizeDiet(member.diet || ""),
                    "Submitted At": createdAt,
                    "Last Updated At": updatedAt,
                };
            };

            if (participant.solo) {
                return buildRow(participant.solo, "Individual");
            }
            if (participant.members) {
                return participant.members.map(member =>
                    buildRow(member, participant.teamName || "Team")
                );
            }
            return [];
        });

        const techCounts = { "Tech": 0, "Non-Tech": 0, "Unknown": 0 };
        allParticipants.forEach((row) => {
            const category = row["Tech vs Non-Tech"] || "Unknown";
            techCounts[category] = (techCounts[category] || 0) + 1;
        });

        const summaryRows = [
            { "Category": "Tech", "Count": techCounts["Tech"] || 0 },
            { "Category": "Non-Tech", "Count": techCounts["Non-Tech"] || 0 },
            { "Category": "Unknown", "Count": techCounts["Unknown"] || 0 },
            { "Category": "Total", "Count": allParticipants.length },
        ];

        const worksheet = XLSX.utils.json_to_sheet(allParticipants);
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

        const rawFileName = "dlw_participants";
        const formattedFileName = rawFileName.toLowerCase().replace(/\s+/g, "-");

        XLSX.writeFile(workbook, `${formattedFileName}.xlsx`);
    };


    return (
        <Protect
            fallback={<div className='text-[#eeeeee] flex flex-col w-screen h-screen justify-center items-center'>Please sign in.</div>}
        >
            <div className='flex flex-col w-full lg:h-screen justify-center items-center px-6 lg:px-12'>
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
                <div className='flex flex-col w-full pt-12 pb-24 md:py-0 lg:h-full'>
                    <div className='ml-2 pt-24 pb-8 items-start flex flex-col justify-end'>
                        <h1 className='flex mb-4 lg:mb-6'>
                            Welcome, {user?.firstName}.
                        </h1>
                        <div className='flex lg:text-sm w-[60vw] text-[#eeeeee]'>
                            Here, you can manage participant data and access key insights.
                        </div>
                    </div>
                    <div className='flex w-full h-full  overflow-hidden'>
                    <div className='grid grid-cols-1 lg:grid-cols-6 lg:grid-rows-6 gap-8 lg:gap-4 w-full h-full min-h-0 overflow-hidden pb-8'>
                        <div className='flex flex-col w-full lg:col-span-3 lg:row-span-5 h-full containerFormat p-4'>
                            <div className='flex text-[#c1c2c7] text-lg ml-2 py-2 font-medium uppercase tracking-tight mb-4'>List of Participants</div>
                            <input
                                type="text"
                                placeholder="Search participants"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`flex items-center mb-4 uppercase inputDesign outline-none ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            />
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
                            <button
                                onClick={downloadData}
                                disabled={isRefreshing}
                                className={`flex items-center mb-4 uppercase buttonDesign2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <FiDownload className='inline mr-2' />
                                Download
                            </button>
                            <div className='flex flex-col w-full divide-y divide-[#1f1f21] overflow-scroll h-[60vh]'>
                                {isLoading ? (
                                    <ShimmerPlaceholder />
                                ) : (
                                    filteredData.map((participant) => (
                                        <div key={participant._id}>
                                            {participant.solo ? (
                                                <div className="flex items-center justify-between px-6 my-2 w-full h-10">
                                                    <div className='flex gap-4'>
                                                        <div className="flex soloStyle">Solo</div>
                                                        <div className="block soloStyleSoft w-[60px] lg:w-[200px] truncate">{participant.solo.name}</div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleView(participant._id)}
                                                            className='flex viewButton'>
                                                            View
                                                        </button>
                                                        {isExco && (
                                                            <button
                                                                onClick={() => startDelete(participant._id, participant.solo.name)}
                                                                className='flex deleteButton2 items-center justify-center'>
                                                                <FiTrash2 size={10} className='flex'/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between px-6 my-2 w-full h-10">
                                                    <div className='flex gap-4'>
                                                        <div className="flex teamStyle">Team</div>
                                                        <div className="block teamStyleSoft w-[60px] lg:w-[200px] truncate">
                                                            {participant.teamName} {participant.members && ` (${participant.members.length} pax)`}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleView(participant._id)}
                                                            className='flex viewButton'>
                                                            View
                                                        </button>
                                                        {isExco && (
                                                            <button
                                                                onClick={() => startDelete(participant._id, participant.teamName)}
                                                                className='flex deleteButton2 items-center justify-center'>
                                                                <FiTrash2 size={10} className='flex'/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className='flex w-full lg:col-span-3 lg:row-span-2 h-full text-[#eeeeee] containerFormat'>
                            <div className='flex h-[20vh] lg:h-full flex-col w-full overflow-scroll items-center justify-center px-4'>
                                {isLoading ? (
                                    <ShimmerPlaceholder />
                                ) : (
                                    <div className='flex h-full justify-between w-full '>
                                        <div className="flex flex-col items-center w-full justify-center">
                                            <div className='flex w-full items-center justify-center text-center text-[#c1c2c7] text-xs font-medium uppercase tracking-tight mb-6'>PARTICIPANTS</div>
                                            <h1 className='flex font-semibold w-full items-center justify-center text-center text-[42px] lg:text-[72px]'>
                                                {stats.totalParticipants}
                                            </h1>
                                        </div>
                                        <div className="flex flex-col items-center w-full justify-center">
                                            <div className='flex w-full items-center justify-center text-center text-[#c1c2c7] text-xs font-medium uppercase tracking-tight mb-6'>TEAMS</div>
                                            <h1 className='flex font-semibold w-full items-center justify-center text-center text-[42px] lg:text-[72px]'>
                                                {stats.numberOfTeams}
                                            </h1>

                                        </div>
                                        <div className="flex flex-col items-center w-full justify-center">
                                            <div className='flex w-full items-center justify-center text-center text-[#c1c2c7] text-xs font-medium uppercase tracking-tight mb-6'>INDIVIDUALS</div>
                                            <h1 className='flex font-semibold w-full items-center justify-center text-center text-[42px] lg:text-[72px]'>
                                                {stats.numberOfSoloMembers}
                                            </h1>

                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='flex w-full lg:col-span-1 lg:row-span-3 h-full containerFormat'>
                            <div className="flex w-full lg:h-full flex-col items-center justify-center p-10 lg:p-0">
                                <div className='flex text-[#c1c2c7] text-lg lg:px-6 mb-6 lg:mb-3 font-medium uppercase tracking-tight lg:w-full'>Gender Gap</div>
                                {isLoading ? (
                                    <ShimmerPlaceholder />
                                ) : (
                                    <Pie
                                        data={{
                                            labels: Object.keys(stats.genderCounts).map(gender => genderMap[gender] || gender),
                                            datasets: [
                                                {
                                                    data: Object.values(stats.genderCounts),
                                                    backgroundColor: ["#26272e", "#343640", "#484b59"],
                                                    borderWidth: 0,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    labels: {
                                                        color: "#eeeeee",
                                                        font: {
                                                            size: 9,
                                                            family: "Montserrat, sans-serif",
                                                        },
                                                    },
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (tooltipItem) {
                                                            const dataset = tooltipItem.dataset;
                                                            const total = dataset.data.reduce((acc, val) => acc + val, 0);
                                                            const value = dataset.data[tooltipItem.dataIndex];
                                                            const percentage = ((value / total) * 100).toFixed(1);

                                                            return `${value} (${percentage}%)`;
                                                        },
                                                    },
                                                },
                                            },
                                        }}

                                    />
                                )}
                            </div>
                        </div>

                        <div className='flex w-full lg:col-span-2 lg:row-span-3 p-10 lg:px-0 lg:py-10 h-full text-[#eeeeee] containerFormat'>
                            <div className='flex flex-col w-full items-center justify-center'>
                                <div className='flex text-[#c1c2c7] text-lg ml-2  font-medium uppercase tracking-tight mb-6 lg:w-full lg:ml-20'>Universities</div>
                                <div className="flex flex-col w-full lg:px-8">
                                    {isLoading ? (
                                        <ShimmerPlaceholder />
                                    ) : (
                                        <Bar
                                            className='flex'
                                            data={{
                                                labels: Object.keys(stats.studentsByUniversity).map(uni => universityMap[uni] || uni),
                                                datasets: [
                                                    {
                                                        data: Object.values(stats.studentsByUniversity),
                                                        backgroundColor: "#606478",
                                                        borderRadius: 3,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (tooltipItem) {
                                                                const dataset = tooltipItem.dataset;
                                                                const total = dataset.data.reduce((acc, val) => acc + val, 0);
                                                                const value = dataset.data[tooltipItem.dataIndex];
                                                                const percentage = ((value / total) * 100).toFixed(1);

                                                                return `${value} (${percentage}%)`;
                                                            },
                                                        },
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: {
                                                            color: "#eeeeee",
                                                            font: {
                                                                size: 9,
                                                                family: "Montserrat, sans-serif",
                                                                weight: "light",
                                                            },
                                                        },
                                                    },
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            color: "#eeeeee",
                                                            font: {
                                                                size: 9,
                                                                family: "Montserrat, sans-serif",
                                                                weight: "light",
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link
                                    href="/pre-uni-institutes"
                                    className='flex w-full lg:col-span-3 lg:row-span-1 h-full containerFormat text-[#c1c2c7] text-lg font-medium uppercase tracking-tight mb-4 justify-between items-center
                                    hover:bg-[#1f1f21]  transition duration-200 ease-in-out p-6
                                    '
                                >
                                   Pre-Uni Institutes
                                   <FiChevronsRight className='ml-2'/>
                                </Link>

                    </div>
                    </div>
                </div>
            </div>
        </Protect>
    )
}

export default Dashboard