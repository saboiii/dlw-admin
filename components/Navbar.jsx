import { Protect, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Navbar() {
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
                    <UserButton />
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
                <UserButton />
            </div>
        </Protect>

    )
}

export default Navbar