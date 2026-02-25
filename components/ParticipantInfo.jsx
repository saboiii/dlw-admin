'use client'

import React, { useEffect, useState } from 'react'

import CopyField from './CopyField';
import { FiEdit2 } from "react-icons/fi";

function ParticipantInfo({ participant, canEdit = false, onUpdateField }) {

    const [isEditingName, setIsEditingName] = useState(false);
    const [draftName, setDraftName] = useState(participant.name || '');
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [draftParticipantType, setDraftParticipantType] = useState(participant.participantType || 'uni');
    const [draftUni, setDraftUni] = useState(participant.uni || '');
    const [draftInstitutionName, setDraftInstitutionName] = useState(participant.institutionName || '');
    const [draftSize, setDraftSize] = useState(participant.size || '');
    const [draftNight, setDraftNight] = useState(Boolean(participant.night));

    useEffect(() => {
        if (isEditingName) return;
        setDraftName(participant.name || '');
    }, [participant.name, isEditingName]);

    useEffect(() => {
        if (isEditingTags) return;
        setDraftParticipantType(participant.participantType || 'uni');
        setDraftUni(participant.uni || '');
        setDraftInstitutionName(participant.institutionName || '');
        setDraftSize(participant.size || '');
        setDraftNight(Boolean(participant.night));
    }, [participant, isEditingTags]);

    const universityMap = {
        "Nanyang Technological University": "NTU",
        "National University of Singapore": "NUS",
        "Singapore University of Design & Technology": "SUTD",
        "Singapore University of Social Sciences": "SUSS",
        "Singapore Management University": "SMU",
        "Singapore Institute of Technology": "SIT",
        "Singapore Institute of Management": "SIM",
    };



    const genderMap = {
        "he": "Male",
        "she": "Female",
        "they": "Prefer not to say",
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

    const participantType = participant.participantType || "uni";

    const handleNameSave = async () => {
        if (!onUpdateField) return;
        const nextName = draftName.trim();
        if (!nextName) return;
        try {
            await onUpdateField('name', nextName);
            setIsEditingName(false);
        } catch (error) {
            console.error('Failed to update name:', error);
        }
    };

    const handleNameCancel = () => {
        setIsEditingName(false);
        setDraftName(participant.name || '');
    };

    const handleTagsSave = async () => {
        if (!onUpdateField) return;
        const updates = [];

        if (draftParticipantType !== (participant.participantType || 'uni')) {
            updates.push(['participantType', draftParticipantType]);
        }

        if (draftParticipantType === 'uni') {
            if (draftUni !== (participant.uni || '')) {
                updates.push(['uni', draftUni]);
            }
            if (participant.institutionName) {
                updates.push(['institutionName', '']);
            }
        } else {
            if (draftInstitutionName !== (participant.institutionName || '')) {
                updates.push(['institutionName', draftInstitutionName]);
            }
            if (participant.uni) {
                updates.push(['uni', '']);
            }
        }

        if (draftSize !== (participant.size || '')) {
            updates.push(['size', draftSize]);
        }

        if (draftNight !== Boolean(participant.night)) {
            updates.push(['night', draftNight]);
        }

        try {
            for (const [field, value] of updates) {
                await onUpdateField(field, value);
            }
            setIsEditingTags(false);
        } catch (error) {
            console.error('Failed to update tags:', error);
        }
    };

    const handleTagsCancel = () => {
        setIsEditingTags(false);
        setDraftParticipantType(participant.participantType || 'uni');
        setDraftUni(participant.uni || '');
        setDraftInstitutionName(participant.institutionName || '');
        setDraftSize(participant.size || '');
        setDraftNight(Boolean(participant.night));
    };

    return (
        <div className='flex flex-col justify-center w-full gap-4 px-12 '>
            <div className='flex items-center gap-3 mb-4'>
                {isEditingName ? (
                    <>
                        <input
                            value={draftName}
                            onChange={(event) => setDraftName(event.target.value)}
                            className='bg-transparent border-b border-[#2b2b2d] text-slate-200 outline-none'
                        />
                        <button
                            onClick={handleNameSave}
                            className='text-xs uppercase tracking-wide text-gray-500 hover:text-slate-200 transition duration-200 ease-in-out'
                        >
                            Save
                        </button>
                        <button
                            onClick={handleNameCancel}
                            className='text-xs uppercase tracking-wide text-gray-500 hover:text-slate-200 transition duration-200 ease-in-out'
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className='flex font-normal'>{participant.name}</h2>
                        {canEdit && (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className='text-[#2b2b2d] hover:text-slate-200 transition duration-200 ease-in-out'
                                aria-label='Edit name'
                            >
                                <FiEdit2 size={16} />
                            </button>
                        )}
                    </>
                )}
            </div>
            <div className='flex flex-wrap gap-4 mb-4 items-center'>
                <div className='bg-gradient-to-r from-[#874462] to-[#965a75] infoTag'>Solo</div>
                <div className='bg-gradient-to-r from-[#2f6f6c] to-[#2b5f5d] infoTag'>{participantTypeMap[participantType] || participantType}</div>
                {participant.uni && (
                    <div className='bg-gradient-to-r from-[#448785] to-[#3f6c6b] infoTag'>{universityMap[participant.uni] || participant.uni}</div>
                )}
                {participant.institutionName && (
                    <div className='bg-gradient-to-r from-[#3c5a86] to-[#2b4a73] infoTag'>{participant.institutionName}</div>
                )}
                <div className='bg-gradient-to-r from-[#a9654c] to-[#c86f52] infoTag'>Size {participant.size}</div>
                <div className='bg-gradient-to-r from-[#5f4487] to-[#7e63a7] infoTag '>{genderMap[participant.gender] || participant.gender}</div>
                <div className={`bg-gradient-to-r ${participant.night ? 'from-[#423b77] to-[#2d2669]' : 'from-[#7f2d2d] to-[#c65247]'} infoTag`}>{participant.night ? 'Staying Overnight' : 'Not Staying Overnight'}</div>
                {canEdit && (
                    <button
                        onClick={() => setIsEditingTags(true)}
                        className='text-[#2b2b2d] hover:text-slate-200 transition duration-200 ease-in-out'
                        aria-label='Edit tags'
                    >
                        <FiEdit2 size={16} />
                    </button>
                )}
            </div>

            {canEdit && isEditingTags && (
                <div className='flex flex-wrap gap-4 mb-4 items-end'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs uppercase text-gray-500'>Participant Type</span>
                        <select
                            value={draftParticipantType}
                            onChange={(event) => setDraftParticipantType(event.target.value)}
                            className='bg-[#151518] border border-[#1f1f21] rounded px-3 py-2 text-slate-200'
                        >
                            <option value='uni'>University Student</option>
                            <option value='preuni'>Pre-University Student</option>
                        </select>
                    </div>

                    {draftParticipantType === 'uni' ? (
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs uppercase text-gray-500'>University</span>
                            <select
                                value={draftUni}
                                onChange={(event) => setDraftUni(event.target.value)}
                                className='bg-[#151518] border border-[#1f1f21] rounded px-3 py-2 text-slate-200'
                            >
                                <option value='' disabled>
                                    Select University
                                </option>
                                <option value='Nanyang Technological University'>
                                    Nanyang Technological University
                                </option>
                                <option value='Singapore University of Design & Technology'>
                                    Singapore University of Design &amp; Technology
                                </option>
                                <option value='National University of Singapore'>
                                    National University of Singapore
                                </option>
                                <option value='Singapore Institute of Technology'>
                                    Singapore Institute of Technology
                                </option>
                                <option value='Singapore Management University'>
                                    Singapore Management University
                                </option>
                                <option value='Singapore University of Social Sciences'>
                                    Singapore University of Social Sciences
                                </option>
                                <option value='Singapore Institute of Management'>
                                    Singapore Institute of Management
                                </option>
                            </select>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs uppercase text-gray-500'>Institution Name</span>
                            <input
                                value={draftInstitutionName}
                                onChange={(event) => setDraftInstitutionName(event.target.value)}
                                className='bg-[#151518] border border-[#1f1f21] rounded px-3 py-2 text-slate-200'
                            />
                        </div>
                    )}

                        <div className='flex flex-col gap-1'>
                            <span className='text-xs uppercase text-gray-500'>T-Shirt Size</span>
                            <select
                                value={draftSize}
                                onChange={(event) => setDraftSize(event.target.value)}
                                className='bg-[#151518] border border-[#1f1f21] rounded px-3 py-2 text-slate-200'
                            >
                                <option value='XS'>XS</option>
                                <option value='S'>S</option>
                                <option value='M'>M</option>
                                <option value='L'>L</option>
                                <option value='XL'>XL</option>
                            </select>
                        </div>

                    <div className='flex flex-col gap-1'>
                        <span className='text-xs uppercase text-gray-500'>Overnight</span>
                        <select
                            value={draftNight ? 'yes' : 'no'}
                            onChange={(event) => setDraftNight(event.target.value === 'yes')}
                            className='bg-[#151518] border border-[#1f1f21] rounded px-3 py-2 text-slate-200'
                        >
                            <option value='yes'>Yes</option>
                            <option value='no'>No</option>
                        </select>
                    </div>

                    <div className='flex gap-3 text-xs uppercase tracking-wide'>
                        <button
                            onClick={handleTagsSave}
                            className='px-3 py-2 rounded border border-[#3a3a3d] text-slate-200 hover:bg-[#1b1b1e] transition duration-200 ease-in-out'
                        >
                            Save Tags
                        </button>
                        <button
                            onClick={handleTagsCancel}
                            className='px-3 py-2 rounded border border-[#2b2b2d] text-[#808085] hover:text-slate-200 hover:bg-[#141417] transition duration-200 ease-in-out'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <CopyField
                content={participant.email}
                title={'Personal Email'}
                editable={canEdit}
                onSave={(value) => onUpdateField?.('email', value)}
            />

            {participant.ntuEmail && (
                <CopyField
                    content={participant.ntuEmail}
                    title={'NTU Email'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('ntuEmail', value)}
                />
            )}

            {participant.matricNo && (
                <CopyField
                    content={participant.matricNo}
                    title={'Matriculation No.'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('matricNo', value)}
                />
            )}

            <CopyField
                content={participant.tele}
                title={'Telegram Handle'}
                editable={canEdit}
                onSave={(value) => onUpdateField?.('tele', value)}
            />

            <CopyField
                content={participant.course}
                title={'Course'}
                editable={canEdit}
                onSave={(value) => onUpdateField?.('course', value)}
            />

            <CopyField
                content={participant.gender}
                displayValue={genderMap[participant.gender] || participant.gender}
                title={'Gender'}
                editable={canEdit}
                onSave={(value) => onUpdateField?.('gender', value)}
            />

            {participant.institutionName && (
                <CopyField
                    content={participant.institutionName}
                    title={'Institution Name'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('institutionName', value)}
                />
            )}

            {participant.preUniCategory && (
                <CopyField
                    content={participant.preUniCategory}
                    title={'Pre-University Category'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('preUniCategory', value)}
                />
            )}

            {participant.expectedGradYear && (
                <CopyField
                    content={participant.expectedGradYear}
                    title={'Expected Graduation Year'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('expectedGradYear', value)}
                />
            )}

            {participant.school && (
                <CopyField
                    content={participant.school}
                    title={'School'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('school', value)}
                />
            )}

            {participant.degreeType && (
                <CopyField
                    content={participant.degreeType}
                    displayValue={degreeTypeMap[participant.degreeType] || participant.degreeType}
                    title={'Degree Type'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('degreeType', value)}
                />
            )}

            {participant.year && (
                <CopyField
                    content={participant.year}
                    title={'Year'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('year', value)}
                />
            )}

            {participant.nationality && (
                <CopyField
                    content={participant.nationality}
                    displayValue={nationalityMap[participant.nationality] || participant.nationality}
                    title={'Nationality'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('nationality', value)}
                />
            )}

            {participant.dateOfBirth && (
                <CopyField
                    content={participant.dateOfBirth}
                    title={'Date of Birth'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('dateOfBirth', value)}
                />
            )}

            {participant.guardianName && (
                <CopyField
                    content={participant.guardianName}
                    title={'Guardian Name'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('guardianName', value)}
                />
            )}

            {participant.guardianEmail && (
                <CopyField
                    content={participant.guardianEmail}
                    title={'Guardian Email'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('guardianEmail', value)}
                />
            )}

            {participant.guardianPhone && (
                <CopyField
                    content={participant.guardianPhone}
                    title={'Guardian Phone'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('guardianPhone', value)}
                />
            )}

            {typeof participant.guardianConsent === 'boolean' && (
                <CopyField
                    content={participant.guardianConsent}
                    title={'Guardian Consent'}
                    editable={canEdit}
                    fieldType='boolean'
                    onSave={(value) => onUpdateField?.('guardianConsent', value)}
                />
            )}

            {typeof participant.indemnityMsFormConfirmed === 'boolean' && (
                <CopyField
                    content={participant.indemnityMsFormConfirmed}
                    title={'Indemnity MS Form Confirmed'}
                    editable={canEdit}
                    fieldType='boolean'
                    onSave={(value) => onUpdateField?.('indemnityMsFormConfirmed', value)}
                />
            )}

            {participant.diet && (
                <CopyField
                    content={participant.diet}
                    title={'Dietary Preferences'}
                    editable={canEdit}
                    onSave={(value) => onUpdateField?.('diet', value)}
                />
            )}
        </div>
    )
}

export default ParticipantInfo