import React from 'react'
import { IoMdCopy } from "react-icons/io";

function CopyField({content, title}) {
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div className='flex ml-1 uppercase font-medium text-gray-600'>{title}</div>
            <div className='flex w-full md:w-2/3 containerFormat text-slate-200  transition duration-200 ease-in-out justify-between'>
                <div className='flex px-4 py-2'>{content}</div>
                <button onClick={() => handleCopy(content)} className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10'>
                    <IoMdCopy size={16} className='flex' />
                </button>
            </div>
        </div>
    )
}

export default CopyField