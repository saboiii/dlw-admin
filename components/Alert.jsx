import React from 'react'
import {LuCircleAlert} from "react-icons/lu";

function Alert({title, description, alert, continueText, continueFunction, handleAlert, flag}) {
    return (
        <div className={`${alert ? 'flex': 'hidden'} fixed h-full bg-black/80 backdrop-blur-sm flex justify-center items-center left-0 top-0 w-full z-20`}>
            <div className='flex flex-col justify-center text-[#e1e1e2] items-center bg-[#0e0e0e] rounded-xl px-8 md:w-1/3 py-8 md:h-1/3'>
                <LuCircleAlert className='flex mb-4' size={40} />
                <h2 className='flex mb-3'>{title}</h2>
                <div className='flex text-center font-medium mb-4'>{description}</div>
                <div className='flex gap-2'>
                    <button
                        className='flex backButton'
                        onClick={handleAlert}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={continueFunction}
                        disabled={flag}
                        className='flex deleteButton'>
                        {flag ? (
                            <div className="w-4 h-4 border-t border-gray-600 rounded-full animate-spin" />
                        ) : (
                            continueText
                        )}
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Alert