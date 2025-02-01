'use client'
import { Protect, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function Navbar() {
    const { user } = useUser();
    const [onlineUsers, setOnlineUsers] = useState([]);


    useEffect(() => {
        if (!user?.id) return; 

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            authEndpoint: '/api/pusher/auth',
            auth: {
                params: {
                    userId: user.id,
                    firstName: user.firstName,
                    imageUrl: user.imageUrl,
                },
            },
        });

        const channel = pusher.subscribe('presence-online-users');

        channel.bind('pusher:subscription_succeeded', (members) => {
            // console.log("members:", members.members);

            const users = Object.entries(members.members)
                .filter(([_, member]) => member !== null)
                .map(([memberId, member]) => ({
                    userId: memberId,
                    firstName: member.firstName,
                    imageUrl: member.imageUrl,
                }));

            setOnlineUsers(users);
            // console.log("Subscription succeeded, current online users:", users);
        });


        channel.bind('pusher:member_added', (member) => {
            // console.log("Member added:", member);
            const newMember = {
                userId: member.id,
                firstName: member.info?.firstName,
                imageUrl: member.info?.imageUrl,
            };
            setOnlineUsers((prevUsers) => [...prevUsers, newMember]);

        });

        channel.bind('pusher:member_removed', (member) => {
            setOnlineUsers((prevUsers) =>
                prevUsers.filter((u) => u.userId !== member.id)
            );
            // console.log("Member removed:", member);
        });

        return () => {
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [user]);

    return (
        <Protect>
            <div className='hidden lg:flex items-center justify-center flex-col h-screen'>
                <div className='flex flex-col w-14 items-center justify-between bg-[#151518] border border-[#1f1f21] rounded-r-[30px] py-4 z-50 h-[95%]'>
                    <Link href='/'>
                        <Image
                            src='/images/dlw-logo-white.png'
                            height={40}
                            width={40}
                            alt='DLW Logo'
                            priority
                            className='object-fit w-10 h-10'
                        />
                    </Link>
                    <div className='flex flex-col items-center '>
                        {onlineUsers &&
                            onlineUsers
                                .filter((onlineUser) => user && onlineUser.userId !== user.id)
                                .map((onlineUser, index) => (
                                    <div key={index} className='relative mb-2 flex items-center group'>

                                        <div className={`z-[${index + 1}] shadow-lg shadow-black overflow-hidden rounded-full h-[27px] w-[27px] flex`} style={{ transform: `translateY(${-10 * (index + 1)}px)` }}>
                                            <img
                                                src={onlineUser.imageUrl}
                                                height={40}
                                                width={40}
                                                alt={onlineUser.firstName || 'User'}
                                                className='object-cover w-full h-full'
                                            />
                                        </div>
                                        <div className='absolute flex-row items-center flex top-0 left-0  translate-x-8 -translate-y-[12px] px-5 py-2 rounded-xl bg-[#212125] border border-[#1f1f21] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none'>
                                            <div className='flex bg-green-400 w-1 h-1 rounded-full mr-3' />
                                            Online
                                        </div>

                                    </div>
                                ))}

                        <div className='flex '>
                            <UserButton />
                        </div>
                    </div>
                </div>
            </div>
            <div className='fixed left-0 top-0 lg:hidden flex-row flex px-4 h-16 items-center justify-between bg-[#151518] border border-[#1f1f21] z-50 w-full'>
                <Link href='/'>
                    <Image
                        src='/images/dlw-logo-white.png'
                        height={40}
                        width={40}
                        alt='DLW Logo'
                        priority
                        className='object-fit w-10 h-10'
                    />
                </Link>
                <div className='flex items-center justify-center divide-[#2d2d31] divide-x'>
                    <div className='flex items-center'>
                        {onlineUsers &&
                            onlineUsers
                                .filter((onlineUser) => user && onlineUser.userId !== user.id)
                                .map((onlineUser, index) => (
                                    <div key={index} className='relative flex group items-center mr-6'>
                                        <div
                                            className={`z-[${index + 1}] overflow-hidden rounded-full h-[28px] w-[28px] flex`}
                                            style={{ transform: `translateX(${16 * (-index + 1)}px)` }}
                                        >

                                            <img
                                                src={onlineUser.imageUrl}
                                                height={40}
                                                width={40}
                                                alt={onlineUser.firstName || 'User'}
                                                className='object-cover w-full h-full'
                                            />

                                        </div>
                                        <div className='absolute flex-row items-center pointer-events-none flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out top-0 left-0 cursor-pointer -translate-x-[18px] translate-y-10 px-5 py-2 rounded-xl bg-[#151518] border border-[#1f1f21]'>
                                            <div className='flex bg-green-400 w-1 h-1 rounded-full mr-3' />
                                            Online
                                        </div>
                                    </div>
                                ))}
                    </div>
                    <div className="flex pl-4 ml-3">
                        <UserButton />
                    </div>
                </div>

            </div>
        </Protect>
    )
}

export default Navbar
