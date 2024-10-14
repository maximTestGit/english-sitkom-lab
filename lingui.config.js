module.exports = {
    locales: ['en', 'ru', 'af', 'he', 'uk'],
    sourceLocale: 'en',
    catalogs: [
        {
            path: '<rootDir>/src/locales/{locale}/messages',
            include: ['<rootDir>/components'],
        },
    ],
    format: 'po',
};
