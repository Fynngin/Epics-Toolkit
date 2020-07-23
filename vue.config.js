module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? '/Epics-Toolkit/'
        : '/',
    outputDir: "dist"
};