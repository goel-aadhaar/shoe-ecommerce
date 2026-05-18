import mongoose from 'mongoose';

import app from './app.js';
import { config } from './config.js';
import connectDB from './infrastructure/db/connect-db.js';

await connectDB();

const server = app.listen(config.port, () => {
    console.log(
        `Server running in ${config.nodeEnv} mode on port ${config.port}`,
    );
});

let shuttingDown = false;

async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received — shutting down gracefully...`);

    // Stop accepting new connections, let in-flight requests drain.
    server.close(async () => {
        try {
            await mongoose.connection.close();
            console.log('Closed HTTP server and MongoDB connection.');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    // Failsafe: force-exit if a request hangs the drain.
    setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 10000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
});
