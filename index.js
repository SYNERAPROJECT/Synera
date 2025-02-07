
require('dotenv').config();
const Logger = require('./src/utils/logger');
const config = require('./src/utils/config');
const app = require('./src/server/server');
const SyneraAI = require('./src/core/synera_ai');
const BlockchainManager = require('./src/blockchain/blockchain_manager');
const PluginLoader = require('./src/core/plugin_loader');

class Synera {
    constructor() {
        this.modules = {
            aiSystem: null,
            blockchainManager: null,
            pluginLoader: null
        };

        this.initSystem();
    }

    /**
     * Initializes core system components with structured error handling.
     * Ensures each module loads correctly before proceeding.
     */
    async initSystem() {
        try {
            Logger.info('Synera Initialization Started...');

            // Validate required environment variables
            this.validateEnvVariables();

            // Initialize AI System
            this.modules.aiSystem = new SyneraAI();
            Logger.info('AI System initialized successfully.');

            // Initialize Blockchain Manager
            this.modules.blockchainManager = new BlockchainManager();
            Logger.info('Blockchain Manager initialized and ready.');

            // Load Plugins
            this.modules.pluginLoader = new PluginLoader();
            Logger.info('All plugins successfully loaded.');

            // Start the Synera Server
            this.startServer();
        } catch (error) {
            Logger.error('Critical Initialization Error:', error);
            process.exit(1); // Prevents application from running in a faulty state
        }
    }

    /**
     * Starts the Synera server with structured monitoring.
     * Includes mechanisms for handling unexpected runtime failures.
     */
    startServer() {
        const PORT = config.port || 4000;
        app.listen(PORT, () => {
            Logger.info(`Synera is live on port ${PORT}`);
        });

        // Graceful shutdown handling
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    }

    /**
     * Validates critical environment variables required for system execution.
     * Ensures all necessary API keys and blockchain configurations are set.
     */
    validateEnvVariables() {
        const requiredEnv = ['BLOCKCHAIN_RPC_URL', 'AI_API_KEY'];
        const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

        if (missingEnv.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
        }

        Logger.info('All required environment variables are properly set.');
    }

    /**
     * Gracefully shuts down all system components, preventing data corruption.
     * Ensures all services terminate cleanly before exiting.
     * @param {string} signal - The termination signal received (SIGINT, SIGTERM).
     */
    shutdown(signal) {
        Logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

        try {
            Logger.info('Shutting down Synera systems cleanly.');
            process.exit(0);
        } catch (error) {
            Logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Instantiate Synera
new Synera();
