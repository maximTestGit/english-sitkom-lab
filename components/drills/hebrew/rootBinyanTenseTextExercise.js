import React, { useState, useEffect } from 'react';
import { Trans, t } from '@lingui/macro';
import { getCultureLanguageName } from '../../data/configurator';
import { GenerateHebrewRootBinyanExercise, GenerateHebrewRootBinyanExerciseAnalysis } from '../../helpers/fetchData';

const RootBinyanTenseTextExercise = ({
  user,
  tense,
  root,
  binyan,
  infinitive,
  userCulture,
}) => {
  // State for additional parameters
  const [complexity, setComplexity] = useState('beginner');
  const [style, setStyle] = useState('Joke');
  const [length, setLength] = useState(3);

  // State for generated text and user input
  const [hebrewText, setHebrewText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [userInputCopy, setUserInputCopy] = useState('');
  const [autoTranslation, setAutoTranslation] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const [showTranslation, setShowTranslation] = useState(false);

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  useEffect(() => {
    if (showTranslation) {
      setUserInputCopy(userInput);
      setUserInput(autoTranslation);
    } else {
      setUserInput(userInputCopy);
      setUserInputCopy('');
    }
  }, [showTranslation]);

  const handleApply = async () => {
    setShowTranslation(false);
    setHebrewTextWrapper('');
    setUserInputWrapper('');
    setAutoTranslation('');
    setAnalysisResult('');

    console.log('Applying changes...',
      user,
      root,
      infinitive,
      binyan,
      tense,
      userCulture,
      complexity,
      style,
      length
    );

    const result = await GenerateHebrewRootBinyanExercise(
      user,
      root,
      binyan,
      tense,
      getCultureLanguageName(userCulture),
      complexity,
      style,
      length
    );

    setHebrewTextWrapper(result.text);
    setAutoTranslation(result.textTranslation);
    setUserInputWrapper('');
  };

  const handleCheck = async () => {
    const analysis = await GenerateHebrewRootBinyanExerciseAnalysis(user, hebrewText, getCultureLanguageName(userCulture), userInput);
    setAnalysisResult(analysis);
  };
  const setUserInputWrapper = (value) => {
    setUserInput(value);
    console.log('setUserInputWrapper', value);
  };
  const setHebrewTextWrapper = (value) => {
    setHebrewText(value);
    console.log('setHebrewTextWrapper', value);
  };
  return (
    <div className="w-full h-full">
      <h4 className="text-center mb-3">{root}/{binyan}/{tense}</h4>
      <div>
        <div id='ComplexityStyleLengthArea'
          className="d-flex flex-row align-items-center mb-2 border p-1 flex-wrap">
          <div id="ComplexityArea"
            className='me-3'
          >
            <label className="block me-2"><Trans>Complexity</Trans></label>
            <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full">
              <option value="kid"><Trans>Kid</Trans></option>
              <option value="beginner"><Trans>Beginner</Trans></option>
              <option value="intermediate"><Trans>Intermediate</Trans></option>
              <option value="advanced"><Trans>Advanced</Trans></option>
            </select>
          </div>
          <div id='StyleArea'
            className='me-3'
          >
            <label className=" me-2"><Trans>Style</Trans></label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full">
              <option value="Kids"><Trans>Kids</Trans></option>
              <option value="Joke" selected="true"><Trans>Joke</Trans></option>
              <option value="Sports"><Trans>Sports</Trans></option>
              <option value="Philosophy"><Trans>Philosophy</Trans></option>
            </select>
          </div>
          <div id='LengthArea'
            className='me-3'
          >
            <label className="block me-2"><Trans>Number of sentences</Trans></label>
            <select value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full mt-2">
            <button id='ApplyButton' onClick={handleApply} className="w-full">
              <Trans>Generate Exercise</Trans>
            </button>
          </div>
        </div>
        <div id='TextAreasDiv' className="d-flex flex-column mb-3">
          <textarea
            id='HebrewText'
            value={hebrewText}
            readOnly
            className="w-full mb-3"
            style={{
              height: '150px', maxHeight: '300px'
            }}
            dir="rtl"
          />
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefault"
              checked={showTranslation}
              onChange={handleToggleTranslation}
              disabled={!autoTranslation}
            />
            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
              <Trans>Show Translation</Trans>
            </label>
          </div>
          <textarea
            id='UserTranslationText'
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full"
            placeholder={t`Enter your translation here...`}
            style={{ height: '150px', maxHeight: '300px' }}
            readOnly={showTranslation}
          />
        </div>
        <button
          onClick={handleCheck}
          className="w-full mb-2"
          disabled={!userInput || showTranslation}
        >
          <Trans>Check Answer</Trans>
        </button>
        <div id='AnalysisArea' className="d-flex flex-column mb-3">
          <textarea
            id='AnalysisText'
            value={analysisResult}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full"
            style={{ maxHeight: '300px' }}
          />
        </div>
      </div>
    </div >
  );
};

export default RootBinyanTenseTextExercise;