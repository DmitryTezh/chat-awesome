if (process.env.NODE_ENV === 'production') {
    module.exports = {
        port: 3000,
        enableLogging: false,
        sessionSecretKey: 'chatawesomesecretkey'
    }
}
else {
    module.exports = {
        port: 5000,
        enableLogging: true,
        originUrl: 'http://localhost:3000',
        sessionSecretKey: 'chatawesomesecretkey'
    }
}