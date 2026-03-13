// Global logger used every where in the app

class Logger {
    debug(message, context = {}){
        if (__DEV__){
            console.debug('DEBUG: ', message, context);
        }
    }
    info(message, context = {}){
        if (__DEV__){
            console.info('INFO: ', message, context);
        }
    }
    warn(message, context = {}){
        if (__DEV__){
            console.warn('WARNING: ', message, context);
        }
    }
    error(message, context = {}){
        if (__DEV__){
            console.error('ERROR: ', message, context);
        }
    }
}

const logger = new Logger();

export default logger;