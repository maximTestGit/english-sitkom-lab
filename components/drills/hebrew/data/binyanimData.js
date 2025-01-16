import { Trans, t } from '@lingui/macro';

export const binyanim = [
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

export const tenses = [
    { value: 'present', label: t`Present` },
    { value: 'past', label: t`Past` },
    { value: 'future', label: t`Future` }//,
    //{ value: 'imperative', label: t`Imperative` }
];

