import * as grammarCommon from './grammarCommon';

export const grammarNumbers = [...grammarCommon.grammarNumbers];
export const grammarGenders = [grammarCommon.grammarGenders.undefined, grammarCommon.grammarGenders.masculine, grammarCommon.grammarGenders.feminine];
export const grammarVerbTenses = [...grammarCommon.grammarVerbTenses];
export const grammarPersons = [...grammarCommon.grammarPersons];

export const grammarSettings = {
    grammarNumbers: grammarNumbers,
    grammarGenders: grammarGenders,
    grammarVerbTenses: grammarVerbTenses,
    grammarPersons: grammarPersons,
};
