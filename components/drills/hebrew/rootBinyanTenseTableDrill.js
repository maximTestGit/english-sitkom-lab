import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getBinyanimForRoot } from '../../helpers/fetchData';
import HebrewVerbConjExercise from './hebrewVerbConjExercise';
import { getCultureLanguageName } from '../../data/configurator';
import { getBinyanData } from './data/binyanimExamples';
import { binyanim, tenses } from './data/binyanimData';
import { Trans, t } from '@lingui/macro';
import ChooseBinyanParams from './chooseBinyanParams'; // Import the new component

const RootBinyanTenseTableDrill = ({ user, uiLanguage }) => {
    const [root, setRoot] = useState('');
    const [binyan, setBinyan] = useState('');
    const [tense, setTense] = useState('');

    const [currRoot, setCurrRoot] = useState('');
    const [currBinyan, setCurrBinyan] = useState('');
    const [currTense, setCurrTense] = useState('');

    const [conjugationsData, setConjugationsData] = useState({});
    const [conjugationsExample, setConjugationsExample] = useState({});
    const [infinitiveData, setInfinitiveData] = useState({});

    const getBinyanLabel = (binyan) => {
        const binyanData = binyanim.find((item) => item.value === binyan);
        return binyanData ? binyanData.label.split(' - ')[1] : '';
    };

    const getTenseLabel = (tense) => {
        const tenseData = tenses.find((item) => item.value === tense);
        return tenseData ? tenseData.label : '';
    };

    const handleSubmit = async (root, binyan, tense) => {
        if (!root || !binyan || !tense) {
            Swal.fire({
                icon: 'error',
                title: t`Invalid Input:`,
                text: t`Please select a root, binyan, and tense to proceed!`,
            });
            return;
        }
        setRoot(root);
        setBinyan(binyan);
        setTense(tense);

        const binyanCode = binyanim.find((item) => item.value === binyan).code;
        const { infinitive, conjugation } = await getBinyanimForRoot(
            user,
            root,
            binyanCode,
            tense,
            getCultureLanguageName(uiLanguage)
        );
        setConjugationsData(conjugation);
        const example = getBinyanData(root === 'כתב' ? 'חשב' : 'כתב', binyanCode, tense);
        setConjugationsExample(example);
        setInfinitiveData(infinitive);
        setCurrRoot(root);
        setCurrBinyan(binyan);
        setCurrTense(tense);
    };

    const setBinyanWrapper = (value) => {
        setBinyan(value);
    };

    return (
        <>
            <ChooseBinyanParams
                onSetRoot={setRoot}
                onSetBinyan={setBinyanWrapper}
                onSetTense={setTense}
                onSubmit={handleSubmit}
            />
            <div
                id="TableAreaDiv"
                style={{ opacity: currRoot !== root || currBinyan !== binyan || currTense !== tense ? 0.5 : 1 }}
                className='row justify-content-center'
            >
                <div className='row justify-content-center'>
                    {conjugationsData?.length > 0 && (
                        <div className='col-12 col-md-6 justify-content-center'>
                            <HebrewVerbConjExercise
                                tense={getTenseLabel(currTense)}
                                root={currRoot}
                                binyan={getBinyanLabel(currBinyan)}
                                infinitive={infinitiveData}
                                conjugations={conjugationsData}
                                conjugationsExample={conjugationsExample}
                                disabled={currRoot !== root || currBinyan !== binyan || currTense !== tense}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RootBinyanTenseTableDrill;