module.exports = {
    testDir: './tests',
    use: { channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true, viewport: { width: 1440, height: 1000 } },
    webServer: {
        command: 'python -m http.server 8765 --bind 127.0.0.1',
        url: 'http://127.0.0.1:8765',
        reuseExistingServer: true,
    },
    reporter: 'list',
};
