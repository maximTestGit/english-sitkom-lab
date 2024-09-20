import { learningLanguage } from './configurator';

export const playlistRegistry = [
    {
        listId: 'PLuMmOfYkVMQ4JLnITRV9Ju_VX3xny7Imi',
        listName: 'Friends',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ5P4pAqLFQNMfCxoCRCpvTL',
        listName: 'English for Kids',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ6m4jdJS_fO5_Wc726IPjs9',
        listName: 'The Big Bang Theory',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ4yiChOU3tS-srFvN6XbwR_',
        listName: 'Young Sheldon',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ6LI5628EcC2aonQVzuhNis',
        listName: 'Two and a Half Men',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ7chIB1qdn3tDNWhNYBQUtE',
        listName: 'Harry Potter',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ413qlCiq-0TR6vzcf3bjpC',
        listName: 'Others',
        language: 'English',
        languageCulture: 'en-US',
    },
    {
        listId: 'PLuMmOfYkVMQ6srhqxBt-bVPK4kL6EPK4f',
        listName: 'External English',
        language: 'English',
        languageCulture: 'en-US',
        isExternal: true,
    },
    {
        listId: 'PLuMmOfYkVMQ5BVRFMfLKXmnabpNNIr8yX',
        listName: 'Hebrew',
        language: 'Hebrew',
        languageCulture: 'he-IL',
    },
    {
        listId: 'PLuMmOfYkVMQ7Eg8LYDP_SZvwryiH2BpGE',
        listName: 'External Hebrew',
        language: 'Hebrew',
        languageCulture: 'he-IL',
    },
    // {
    //     listId: null,
    //     listName: 'Temp Hebrew',
    //     language: 'Hebrew',
    //     languageCulture: 'he-IL',
    // },
].filter(item => !learningLanguage || item.languageCulture === learningLanguage);