import * as grammarCommon from './grammarCommon';

export const grammarNumbers = [grammarCommon.grammarNumbers.undefined, grammarCommon.grammarNumbers.singular, grammarCommon.grammarNumbers.plural];
export const grammarGenders = [...grammarCommon.grammarGenders];
export const grammarVerbTenses = [...grammarCommon.grammarVerbTenses];
export const grammarPersons = [...grammarCommon.grammarPersons];

export const grammarSettings = {
    grammarNumbers: grammarNumbers,
    grammarGenders: grammarGenders,
    grammarVerbTenses: grammarVerbTenses,
    grammarPersons: grammarPersons,
};
