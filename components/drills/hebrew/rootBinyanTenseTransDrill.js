import React, { useState } from 'react';
import Swal from 'sweetalert2';
import RootBinyanTenseTextExercise from './rootBinyanTenseTextExercise';
import { Trans, t } from '@lingui/macro';
import ChooseBinyanParams from './chooseBinyanParams';

const RootBinyanTenseTransDrill = ({ user, uiLanguage }) => {
    const [root, setRoot] = useState('');
    const [binyan, setBinyan] = useState('');
    const [tense, setTense] = useState('');

    return (
        <div className='row justify-content-center'>
            <ChooseBinyanParams
                onSetRoot={setRoot}
                onSetBinyan={setBinyan}
                onSetTense={setTense}
            />
            {root && binyan && tense && (
                <div className='col-12 col-md-6 justify-content-center'>
                    <RootBinyanTenseTextExercise
                        user={user}
                        root={root}
                        binyan={binyan}
                        tense={tense}
                        userCulture={uiLanguage}
                    />
                </div>
            )
            }
        </div>
    )
};

export default RootBinyanTenseTransDrill;