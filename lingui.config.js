module.exports = {
    locales: ['en', 'ru', 'af', 'he', 'uk', 'ar', 'de', 'es', 'fr', 'hr', 'ja', 'tr', 'zh'],
    sourceLocale: 'en',
    catalogs: [
        {
            path: '<rootDir>/src/locales/{locale}/messages',
            include: ['<rootDir>/components'],
        },
    ],
    format: 'po',
};