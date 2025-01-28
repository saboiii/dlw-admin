import React, { useState, useEffect } from 'react';
import { CiCircleCheck } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';

function Message() {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const isMobile = window.innerWidth <= 768;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className='fixed flex left-0 top-0 w-full h-full z-20'
                    initial={{ y: isMobile ? '100%' : '-100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: isMobile ? '100%' : '-100%' }} 
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
                >
                    <div className='absolute bottom-0 md:translate-y-4 md:top-0 md:right-0 md:-translate-x-5 overflow-hidden flex-col justify-between items-center w-full md:w-[40vw] md:h-16 rounded-t-2xl md:rounded-b-2xl bg-[#1f1f23] md:bg-[#151518] shadow-xl shadow-black/40 border border-[#1f1f21]'>
                        <div className='flex md:justify-between px-6 py-8 flex-col items-center md:flex-row md:h-[95%] w-full'>
                            <div className='gap-4 flex flex-col md:flex-row'>
                                <div className='flex font-light text-2xl md:text-sm md:font-medium gap-2 items-center text-green-400'>
                                    <CiCircleCheck size={30} className='mr-2 inline md:w-5 md:h-5' />
                                    Success
                                </div>
                                <div className='flex text-pretty text-sm text-[#eeeeee]'>
                                    Participants permanently removed from database.
                                </div>
                            </div>
                            <IoIosClose 
                                size={30} 
                                className='md:flex text-[#eeeeee] hidden md:w-5 md:h-5 cursor-pointer' 
                                onClick={handleClose}
                            />
                        </div>
                        <div className='h-1 flex md:hidden w-full bg-green-400' />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Message;
