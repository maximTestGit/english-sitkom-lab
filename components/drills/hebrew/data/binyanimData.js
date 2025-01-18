import { Trans, t } from '@lingui/macro';

export const binyanim = [
    {
        value: 'paal', label: `פעל - Pa'al`, code: "0", characteristic:
            `The Pa'al(פעל ,קַל) used for simple, active verbs.` +
            `<br>כתב: כָּתַב (katav) - "he wrote"` +
            `<br>לכתוב: לִכְתּוֹב (likhtov) - "to write"`
    },
    {
        value: 'nifal', label: `נפעל - Nif'al`, code: "10", characteristic:
            `The Nif'al(נִפְעַל) used for passive voice of Pa'al or reflexive actions.` +
            `<br>כתב: נִכְתַּב (nikhtav) - "it was written" ` +
            `<br>להכתב: לְהִכָּתֵב (lehikatev) - "to be written"`
    },
    {
        value: 'piel', label: `פיעל - Pi'el`, code: "20", characteristic:
            `The Pi'el(פִּעֵל) used to intensify the meaning of the verb.` +
            `<br>כתב: כִּתֵּב (kitev) - "he corresponded" ` +
            `<br>לכתיב: לְכַתֵּב (lekatev) - "to correspond"`
    },
    {
        value: 'pual', label: `פועל - Pu'al`, code: "30", characteristic:
            `The Pu'al(פֻּעַל) the passive form of Pi'el.` +
            `<br>כתב: כֻּתַּב (kutav) - "it was written intensively" ` +
            `<br>לכתיב: לְכֻתַּב (lekutav) - "to be written intensively"`
    },
    {
        value: 'hifil', label: `הפעיל - Hif'il`, code: "40", characteristic:
            `The Hif'il(הִפְעִיל) used to cause the action of the verb.` +
            `<br>כתב: הִכְתִּיב (hikhtiv) - "he dictated" ` +
            `<br>להכתיב: לְהַכְתִּיב (lehaktiv) - "to dictate"`
    },
    {
        value: 'hufal', label: `הופעל - Huf'al`, code: "50", characteristic:
            `The Huf'al(הֻפְעַל) the passive form of Hif'il.` +
            `<br>כתב: הֻכְתַּב (hukhtav) - "it was dictated" ` +
            `<br>להכתיב: לְהֻכְתַּב (lehuktav) - "to be dictated"`
    },
    {
        value: 'hitpael', label: `התפעל - Hitpa'el`, code: "60", characteristic:
            `The Hitpa'el(הִתְפַּעֵל) used for reflexive actions.` +
            `<br>כתב: הִתְכַּתֵּב (hitkatev) - "he corresponded" ` +
            `<br>להתכתב: לְהִתְכַּתֵּב (lehitkatev) - "to correspond"`
    }
];

export const tenses = [
    { value: 'present', label: `Presen` },
    { value: 'past', label: `Pas` },
    { value: 'future', label: `Future` }
];

