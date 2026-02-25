'use client'

import React, { useEffect, useState } from 'react'
import { IoMdCopy } from "react-icons/io";
import { FiEdit2 } from "react-icons/fi";

function CopyField({
    content,
    title,
    editable = false,
    fieldType = 'text',
    displayValue,
    onSave,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftValue, setDraftValue] = useState('');

    useEffect(() => {
        if (isEditing) return;
        if (fieldType === 'boolean') {
            setDraftValue(content ? 'true' : 'false');
        } else {
            setDraftValue(content ?? '');
        }
    }, [content, fieldType, isEditing]);
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    const displayText = fieldType === 'boolean'
        ? (content ? 'Yes' : 'No')
        : (displayValue ?? content ?? '');

    const handleSave = async () => {
        if (!onSave || isSaving) return;
        const nextValue = fieldType === 'boolean' ? draftValue === 'true' : draftValue;
        setIsSaving(true);
        try {
            await onSave(nextValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save field:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div className='flex ml-1 uppercase font-medium text-gray-600'>{title}</div>
            <div className='flex w-full md:w-2/3 containerFormat text-slate-200 transition duration-200 ease-in-out justify-between'>
                <div className='px-4 py-2 flex-1 block truncate'>
                    {isEditing ? (
                        fieldType === 'boolean' ? (
                            <select
                                value={draftValue}
                                onChange={(event) => setDraftValue(event.target.value)}
                                className='w-full bg-transparent outline-none text-slate-200'
                            >
                                <option value='true'>Yes</option>
                                <option value='false'>No</option>
                            </select>
                        ) : (
                            <input
                                value={draftValue}
                                onChange={(event) => setDraftValue(event.target.value)}
                                className='w-full bg-transparent outline-none text-slate-200'
                            />
                        )
                    ) : (
                        displayText
                    )}
                </div>
                <div className='flex items-center'>
                    {editable && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10'
                            aria-label={`Edit ${title}`}
                        >
                            <FiEdit2 size={16} className='flex' />
                        </button>
                    )}
                    <button
                        onClick={() => handleCopy(displayText)}
                        className='flex items-center justify-center border-l text-[#2b2b2d] hover:text-slate-200 transition duration-500 ease-in-out border-[#1f1f21] cursor-pointer w-10'
                        aria-label={`Copy ${title}`}
                    >
                        <IoMdCopy size={16} className='flex' />
                    </button>
                </div>
            </div>
            {editable && isEditing && (
                <div className='flex gap-3 ml-1 text-xs uppercase tracking-wide'>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className='px-3 py-1 rounded border border-[#3a3a3d] text-slate-200 hover:bg-[#1b1b1e] transition duration-200 ease-in-out disabled:opacity-50'
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={handleCancel}
                        className='px-3 py-1 rounded border border-[#2b2b2d] text-[#808085] hover:text-slate-200 hover:bg-[#141417] transition duration-200 ease-in-out'
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}

export default CopyField