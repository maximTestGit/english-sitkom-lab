import React, { useState } from 'react';
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
  const [userLanguageText, setUserLanguageText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleApply = async () => {
    setHebrewText('');
    setUserLanguageText('');
    setUserInput(''); // Clear previous user input
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

    setHebrewText(result.text);
    setUserLanguageText(result.textTranslation);
    setUserInput(result.textTranslation); // Clear previous user input
  };

  const handleCheck = async () => {
    const analysis = await GenerateHebrewRootBinyanExerciseAnalysis(user, hebrewText, getCultureLanguageName(userCulture), userInput);
    setAnalysisResult(analysis);
  };

  return (
    <div className="w-full h-full">
      <h4 className="text-center mb-3">{root}/{binyan}/{tense}</h4>
      <div>
        <div id='ComplexityStyleLengthArea'
          className="d-flex flex-row align-items-center mb-2 border p-1">
          <div id="ComplexityArea"
            className='me-3'
          >
            <label className="block me-2">Complexity</label>
            <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full">
              <option value="kid">Kid</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div id='StyleArea'
            className='me-3'
          >
            <label className=" me-2">Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full">
              <option value="Kids">Kids</option>
              <option value="Joke" selected="true">Joke</option>
              <option value="Dialogue">Dialogue</option>
              <option value="Sport">Sport</option>
              <option value="Philosophy">Philosophy</option>
            </select>
          </div>
          <div id='LengthArea'
            className='me-3'
          >
            <label className="block me-2">Length</label>
            <select value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} sentence{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <button id='ApplyButton' onClick={handleApply} >
            Generate Exercise
          </button>
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
          <textarea
            id='UserTranslationText'
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full"
            placeholder="Enter your translation here..."
            style={{ height: '150px', maxHeight: '300px' }}
          />
        </div>
        <button
          onClick={handleCheck}
          className="w-full mb-2"
          disabled={!userInput}
        >
          Check Answer
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