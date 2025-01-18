import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Trans, t } from '@lingui/macro';
import { binyanim, tenses } from './data/binyanimData';
import { on } from 'events';

const ChooseBinyanParams = ({
    onSetRoot,
    onSetBinyan,
    onSetTense,
    onSubmit = null,
}) => {
    const [root, setRoot] = useState('');
    const [binyan, setBinyan] = useState('');
    const [tense, setTense] = useState('');

    const setBinyanCharacteristicDiv = (value) => {
        const binyanData = binyanim.find((item) => item.value === value);
        const binyanCharacteristicDiv = document.getElementById('binyanCharacteristicDiv');
        if (binyanData) {
            binyanCharacteristicDiv.innerHTML = binyanData.characteristic;
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!root || !binyan || !tense) {
            Swal.fire({
                icon: 'error',
                title: t`Invalid Input:`,
                text: t`Please select a root, binyan, and tense to proceed!`,
            });
            return;
        }
        onSubmit(root, binyan, tense);
    };
    const handleSetRoot = (value) => {
        setRoot(value);
        onSetRoot(value);
    };
    const handleSetBinyan = (value) => {
        setBinyan(value);
        setBinyanCharacteristicDiv(value);
        onSetBinyan(value);
    };
    const handleSetTense = (value) => {
        setTense(value);
        onSetTense(value);
    };
    return (
        <div id='ChooseBinyanParansArea' className='row pt-1 mb-1'>
            <div className='col-12 col-md-2 mb-1'>
                <input
                    id="root"
                    className="form-control text-right me-2"
                    //value={root}
                    placeholder={t`Enter Root`}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^[\u0590-\u05FF]{0,4}$/.test(value)) {
                            handleSetRoot(value);
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
            <div className='col-12 col-md-7 mb-1'>
                <div className='row'>
                    <div className='col-12 col-md-4'>
                        <select
                            id="binyan"
                            className="form-select me-2"
                            //value={binyan}
                            onChange={(e) => {
                                handleSetBinyan(e.target.value);
                            }}
                        >
                            <option value=""><Trans>Select Binyan</Trans></option>
                            {binyanim.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div
                        id="binyanCharacteristicDiv"
                        className='border border-dark rounded p-2 col-12 col-md-8 mt-2 mt-md-0 mb-3'
                        placeholder={t`Binyan Characteristic`}
                        style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
                        display={binyan ? 'block' : 'none'}
                    ></div>
                </div>
            </div>
            <div className='col-12 col-md-3 mb-1'>
                <div className='row'>
                    <div className='col-8'>
                        <select
                            id="tense"
                            className="form-select me-2 col-1"
                            //  value={tense}
                            onChange={(e) => handleSetTense(e.target.value)}
                        >
                            <option value=""><Trans>Select Tense</Trans></option>
                            {tenses.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {onSubmit &&
                        <div className='col-4 mb-1'>
                            <button
                                id="submitBtn"
                                className="btn btn-danger"
                                onClick={handleSubmit}
                                style={{ height: '40px' }}
                            >
                                <Trans>Show</Trans>
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default ChooseBinyanParams;