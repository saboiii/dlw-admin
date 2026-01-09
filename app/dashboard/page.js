'use client'
import React, { useEffect, useState } from 'react'
import { useUser, Protect } from "@clerk/nextjs";
import { LuRefreshCcw } from "react-icons/lu";
import Alert from '@/components/Alert';
import Message from '@/components/Message';
import { FiDownload, FiTrash2 } from "react-icons/fi";
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
        nationalityCounts: {}
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

                setStats({ numberOfTeams, numberOfSoloMembers, totalParticipants, studentsByUniversity, genderCounts, schoolCounts, degreeTypeCounts, yearCounts, nationalityCounts });
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
                universityMap[participant.solo.uni]?.toLowerCase().includes(searchLower)
            );
        }

        if (participant.members) {
            return participant.members.some((member) =>
                member.name.toLowerCase().includes(searchLower) ||
                member.email.toLowerCase().includes(searchLower) ||
                member.tele.toLowerCase().includes(searchLower) ||
                universityMap[member.uni]?.toLowerCase().includes(searchLower)
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
            if (participant.solo) {
                return {
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
                };
            } else if (participant.members) {
                return participant.members.map(member => ({
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
            fallback={<div className='text-[#eeeeee] flex flex-col w-full h-screen justify-center items-center'>Please sign in.</div>}
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
                    <div className='ml-2 mb-8 h-[20vh] lg:h-[25%] items-start flex flex-col justify-end'>
                        <h1 className='flex mb-4 lg:mb-6'>
                            Welcome, {user?.firstName}.
                        </h1>
                        <div className='flex lg:text-sm w-[60vw] text-[#eeeeee]'>
                            Here, you can manage participant data and access key insights.
                        </div>
                    </div>
                    <div className='grid lg:h-[75%] grid-cols-1 lg:grid-cols-6 lg:grid-rows-6 gap-8 lg:gap-4 w-full'>
                        <div className='flex flex-col w-full lg:col-span-3 lg:row-span-5 lg:h-full h-[60vh] containerFormat p-4'>
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
                            <div className='flex flex-col w-full divide-y divide-[#1f1f21] overflow-scroll'>
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
                                                        <Protect
                                                            condition={(has) => has({ role: 'org:admin' })}
                                                        >
                                                            <button
                                                                onClick={() => startDelete(participant._id, participant.solo.name)}
                                                                className='flex deleteButton2 items-center justify-center'>
                                                                <FiTrash2 size={10} className='flex'/>
                                                            </button>

                                                        </Protect>
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
                                                        <Protect
                                                            condition={(has) => has({ role: 'org:admin' })}
                                                        >
                                                            <button
                                                                onClick={() => startDelete(participant._id, participant.teamName)}
                                                                className='flex deleteButton2 items-center justify-center'>
                                                                <FiTrash2 size={10} className='flex'/>
                                                            </button>

                                                        </Protect>
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

                    </div>
                </div>
            </div>
        </Protect>
    )
}

export default Dashboard