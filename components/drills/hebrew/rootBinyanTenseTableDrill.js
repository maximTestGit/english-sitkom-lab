import React, { useState } from 'react';
import Swal from 'sweetalert2';
import {
    getBinyanimForRoot,
} from '../../helpers/fetchData';
import HebrewVerbConjugationTable from './hebrewVerbConjugationTable';
import { getCultureLanguageName } from '../../data/configurator';
import { getBinyanData } from './data/binyanimExamples';
import { Trans, t } from '@lingui/macro';

const RootBinyanTenseTableDrill = (
    {
        user,
        uiLanguage,
        onClose
    }
) => {
    const [root, setRoot] = useState('');
    const [binyan, setBinyan] = useState('');
    const [tense, setTense] = useState('');

    const [currRoot, setCurrRoot] = useState('');
    const [currBinyan, setCurrBinyan] = useState('');
    const [currTense, setCurrTense] = useState('');

    const [conjugationsData, setConjugationsData] = useState({});
    const [conjugationsExample, setConjugationsExample] = useState({});
    const [infinitiveData, setInfinitiveData] = useState({});

    const binyanim = [
        {
            value: 'paal', label: t`פעל - Pa'al`, code: "0", characteristic:
                t`The Pa'al(פעל ,קַל) used for simple, active verbs.` +
                t`<br>כתב: כָּתַב (katav) - "he wrote"` +
                t`<br>לכתוב: לִכְתּוֹב (likhtov) - "to write"`
        },
        {
            value: 'nifal', label: t`נפעל - Nif'al`, code: "10", characteristic:
                t`The Nif'al(נִפְעַל) used for passive voice of Pa'al or reflexive actions.` +
                t`<br>כתב: נִכְתַּב (nikhtav) - "it was written" ` +
                t`<br>להכתב: לְהִכָּתֵב (lehikatev) - "to be written"`
        },
        {
            value: 'piel', label: t`פיעל - Pi'el`, code: "20", characteristic:
                t`The Pi'el(פִּעֵל) used to intensify the meaning of the verb.` +
                t`<br>כתב: כִּתֵּב (kitev) - "he corresponded" ` +
                t`<br>לכתיב: לְכַתֵּב (lekatev) - "to correspond"`
        },
        {
            value: 'pual', label: t`פועל - Pu'al`, code: "30", characteristic:
                t`The Pu'al(פֻּעַל) the passive form of Pi'el.` +
                t`<br>כתב: כֻּתַּב (kutav) - "it was written intensively" ` +
                t`<br>לכתיב: לְכֻתַּב (lekutav) - "to be written intensively"`
        },
        {
            value: 'hifil', label: t`הפעיל - Hif'il`, code: "40", characteristic:
                t`The Hif'il(הִפְעִיל) used to cause the action of the verb.` +
                t`<br>כתב: הִכְתִּיב (hikhtiv) - "he dictated" ` +
                t`<br>להכתיב: לְהַכְתִּיב (lehaktiv) - "to dictate"`
        },
        {
            value: 'hufal', label: t`הופעל - Huf'al`, code: "50", characteristic:
                t`The Huf'al(הֻפְעַל) the passive form of Hif'il.` +
                t`<br>כתב: הֻכְתַּב (hukhtav) - "it was dictated" ` +
                t`<br>להכתיב: לְהֻכְתַּב (lehuktav) - "to be dictated"`
        },
        {
            value: 'hitpael', label: t`התפעל - Hitpa'el`, code: "60", characteristic:
                t`The Hitpa'el(הִתְפַּעֵל) used for reflexive actions.` +
                t`<br>כתב: הִתְכַּתֵּב (hitkatev) - "he corresponded" ` +
                t`<br>להתכתב: לְהִתְכַּתֵּב (lehitkatev) - "to correspond"`
        }
    ];

    const getBinyanLabel = (binyan) => {
        const binyanData = binyanim.find((item) => item.value === binyan);
        return binyanData ? binyanData.label.split(' - ')[1] : '';
    };
    const tenses = [
        { value: 'present', label: t`Present` },
        { value: 'past', label: t`Past` },
        { value: 'future', label: t`Future` }//,
        //{ value: 'imperative', label: t`Imperative` }
    ];

    const getTenseLabel = (tense) => {
        const tenseData = tenses.find((item) => item.value === tense);
        return tenseData ? tenseData.label : '';
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log(`RootBinyanTenseTableDrill`, { root, binyan, tense });
        //setBinyan(document.getElementById('binyan').value);
        if (!root || !binyan || !tense) {
            Swal.fire({
                icon: 'error',
                title: t`Invalid Input:`,
                text: t`Please select a root, binyan, and tense to proceed!`,
            });
            return;
        }
        const binyanCode = binyanim.find((item) => item.value === binyan).code;
        const { infinitive, conjugation } = await getBinyanimForRoot(user, root, binyanCode, tense, getCultureLanguageName(uiLanguage));
        console.log(`RootBinyanTenseTableDrill::handleSubmit: binyanData: ${conjugation},  infinitive: ${infinitive}`);;
        setConjugationsData(conjugation);
        const example = getBinyanData(root === 'כתב' ? 'חשב' : 'כתב', binyanCode, tense);
        setConjugationsExample(example);
        setInfinitiveData(infinitive);
        setCurrRoot(root);
        setCurrBinyan(binyan);
        setCurrTense(tense);
    };
    const handleClose = () => {
        onClose();
    };
    const setBinyanWrapper = (value) => {
        setBinyan(value);
        setBinyanCharacteristicDiv(value);
    };
    const setBinyanCharacteristicDiv = (value) => {
        const binyanData = binyanim.find((item) => item.value === value);
        const binyanCharacteristicDiv = document.getElementById('binyanCharacteristicDiv');
        if (binyanData) {
            binyanCharacteristicDiv.innerHTML = binyanData.characteristic;
        }
    };
    return (
        <>
            <div className='row pt-2'>
                <div className='col-2'>
                    <input
                        id="root"
                        className="form-control text-right me-2"
                        value={root}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^[\u0590-\u05FF]{0,4}$/.test(value)) {
                                setRoot(value);
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Invalid Input:',
                                    text: 'Please enter a valid Hebrew root consisting of up to 4 Hebrew letters only.',
                                });
                            }
                        }}
                        dir="rtl"
                    />
                </div>
                <div className='col-7'>
                    <div className='row'>
                        <div className='col-4'>
                            <select
                                id="binyan"
                                className="form-select me-2"
                                value={binyan}
                                onChange={(e) => setBinyanWrapper(e.target.value)}
                            >
                                <option value="">Select Binyan</option>
                                {binyanim.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div id="binyanCharacteristicDiv"
                            className='border border-dark rounded p-2 col-8'
                            style={{ maxHeight: '150px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
                            display={binyan ? 'block' : 'none'}
                        >
                        </div>
                    </div>
                </div>
                <div className='col-3'>
                    <div className='row'>
                        <div className='col-8'>
                            <select
                                id="tense"
                                className="form-select me-2 col-1"
                                value={tense}
                                onChange={(e) => setTense(e.target.value)}
                            >
                                <option value=""><Trans>Select Tense</Trans></option>
                                {tenses.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='col-4'>
                            <button id="submitBtn"
                                className="btn btn-danger"
                                onClick={handleSubmit}
                                // disabled={!root || !binyan || !tense}
                                style={{ height: '40px' }}
                            >
                                <Trans>Show</Trans>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="TableAreaDiv"
                style={{ opacity: (currRoot !== root || currBinyan !== binyan || currTense !== tense) ? 0.5 : 1 }}
            >
                <div>
                    {conjugationsData?.length > 0 &&
                        <HebrewVerbConjugationTable
                            tense={getTenseLabel(currTense)}
                            root={currRoot}
                            binyan={getBinyanLabel(currBinyan)}
                            infinitive={infinitiveData}
                            conjugations={conjugationsData}
                            conjugationsExample={conjugationsExample}
                            disabled={currRoot !== root || currBinyan !== binyan || currTense !== tense}
                        />
                    }
                </div>
            </div>
            <div id="closeBtnDiv" className='row justify-content-center'>
                <button
                    className="btn btn-primary mt-2 col-1"
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        </>
    );
};

export default RootBinyanTenseTableDrill;