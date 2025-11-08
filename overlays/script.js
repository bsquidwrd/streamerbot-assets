/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *                                 📋 OVERLAY SETTINGS 📋
 * 
 *  This is where you can customize how your overlay works!
 *  
 *  You can change any of the numbers below to adjust:
 *  • How long overlays stay on screen
 *  • How big they appear
 *  • Connection details for Streamer.bot
 *  
 *  💡 Tip: Time values are in milliseconds (1000 = 1 second)
 *  💡 Tip: Each setting has helpful comments explaining what it does
 *  💡 Tip: URL parameters can override connection settings (e.g., ?host=192.168.1.100&port=8080&password=mypass)
 *  
 *  Feel free to experiment - you can always change things back! 🎨
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// Helper function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        host: urlParams.get('host'),
        port: urlParams.get('port'),
        path: urlParams.get('path'),
        password: urlParams.get('password')
    };
}

// Get URL parameters for connection settings
const urlParams = getUrlParams();

// Configuration object - Modify these values to customize your overlay behavior
const config = {
    // WebSocket connection settings - How to connect to Streamer.bot
    websocket: {
        host: urlParams.host || '127.0.0.1', // IP address of Streamer.bot (usually localhost)
        port: urlParams.port || '8080',      // Port number Streamer.bot is listening on
        path: urlParams.path || '/',         // WebSocket path (usually just '/')
        password: urlParams.password || '',  // Password if Streamer.bot requires one (leave empty if none)
        reconnectionDelay: 5000              // How long to wait before reconnecting (5 seconds)
    },
    
    // Timing settings - How long things appear and fade (all values in milliseconds)
    timing: {
        statusFadeDelay: 500,             // How long "Connected" status shows before fading (0.5 seconds)
        defaultImageDuration: 5000,       // How long static images show (5 seconds)
        defaultHtmlDuration: 10000,       // How long HTML overlays show when no duration specified (10 seconds)
        progressUpdateInterval: 100       // How often progress bars update (10 times per second)
    },
    
    // Display settings - How media appears on screen
    display: {
        maxScreenPercentage: 85,          // Maximum size of media as percentage of screen (85% to ensure padding)
        viewportPadding: 20,              // Minimum padding from screen edges in pixels
        maxTextWidth: 75                  // Maximum text width as percentage of screen width
    },
    
    // Queue processing settings - How multiple overlays are handled
    queue: {
        processingDelay: 500              // Pause between overlays when multiple are queued (0.5 seconds)
    }
};

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║  ⚠️  WARNING: ADVANCED USERS ONLY - DO NOT EDIT BELOW THIS LINE  ⚠️     ║
 * ║                                                                          ║
 * ║  Editing the code below may break your overlay completely.               ║
 * ║  ✅ Safe to edit: config object above, style.css, index.html             ║
 * ║  🚫 If broken: restore from backup, only change config values            ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// Helper function to calculate maximum dimensions based on screen percentage with safety margins
function getMaxDimensions(naturalWidth, naturalHeight) {
    const maxScreenPercent = config.display.maxScreenPercentage / 100;
    const padding = config.display.viewportPadding * 2; // Padding on both sides
    
    // Calculate available space accounting for padding
    const availableWidth = (window.innerWidth - padding) * maxScreenPercent;
    const availableHeight = (window.innerHeight - padding) * maxScreenPercent;
    
    // Ensure minimum size constraints
    const minWidth = Math.max(availableWidth, 100);
    const minHeight = Math.max(availableHeight, 100);
    
    // Calculate scale factor to fit within available space
    const scaleWidth = minWidth / naturalWidth;
    const scaleHeight = minHeight / naturalHeight;
    const scale = Math.min(scaleWidth, scaleHeight, 1); // Don't scale up, only down
    
    var maxDims = {
        width: Math.floor(naturalWidth * scale),
        height: Math.floor(naturalHeight * scale)
    };
    
    // Double-check dimensions don't exceed screen bounds
    maxDims.width = Math.min(maxDims.width, window.innerWidth - padding);
    maxDims.height = Math.min(maxDims.height, window.innerHeight - padding);
    
    console.log('Calculated safe max dimensions:', maxDims, 'for screen:', window.innerWidth + 'x' + window.innerHeight);
    return maxDims;
}

// Helper function to validate and constrain dimensions to safe screen boundaries
function validateDimensions(width, height) {
    const padding = config.display.viewportPadding * 2;
    const maxSafeWidth = window.innerWidth - padding;
    const maxSafeHeight = window.innerHeight - padding;
    
    // Ensure minimum viable sizes
    const minWidth = Math.min(100, maxSafeWidth);
    const minHeight = Math.min(100, maxSafeHeight);
    
    const validatedWidth = Math.max(minWidth, Math.min(width, maxSafeWidth));
    const validatedHeight = Math.max(minHeight, Math.min(height, maxSafeHeight));
    
    if (validatedWidth !== width || validatedHeight !== height) {
        console.warn('Dimensions constrained for safety:', 
            `${width}x${height} -> ${validatedWidth}x${validatedHeight}`);
    }
    
    return {
        width: validatedWidth,
        height: validatedHeight
    };
}

// Helper function to apply dimensions to media element
function applyMediaDimensions(mediaElement, sourceWidth, sourceHeight, naturalDimensions = null) {
    if (sourceWidth && sourceHeight) {
        // Both dimensions provided - apply screen percentage limit
        const maxDims = getMaxDimensions(sourceWidth, sourceHeight);
        setElementDimensions(mediaElement, maxDims.width, maxDims.height);
    } else if (sourceWidth || sourceHeight) {
        // Only one dimension provided - respect screen percentage limit
        applySingleDimension(mediaElement, sourceWidth, sourceHeight);
    } else if (naturalDimensions) {
        // Use natural dimensions with screen percentage limit
        applyNaturalDimensions(mediaElement, naturalDimensions);
    }
}

// Helper function to set element dimensions with safety validation
function setElementDimensions(element, width, height) {
    const safeDims = validateDimensions(width, height);
    
    element.style.width = safeDims.width + 'px';
    element.style.height = safeDims.height + 'px';
    element.style.maxWidth = safeDims.width + 'px';
    element.style.maxHeight = safeDims.height + 'px';
    
    // Additional safety constraints
    element.style.boxSizing = 'border-box';
    element.style.overflow = 'hidden';
}

// Helper function to apply single dimension with screen limit and safety margins
function applySingleDimension(mediaElement, sourceWidth, sourceHeight) {
    const maxScreenPercent = config.display.maxScreenPercentage / 100;
    const padding = config.display.viewportPadding * 2;
    
    if (sourceWidth) {
        const availableWidth = window.innerWidth - padding;
        const maxWidth = Math.min(sourceWidth, availableWidth * maxScreenPercent);
        const safeMaxHeight = window.innerHeight - padding;
        
        mediaElement.style.width = maxWidth + 'px';
        mediaElement.style.height = 'auto';
        mediaElement.style.maxWidth = maxWidth + 'px';
        mediaElement.style.maxHeight = safeMaxHeight + 'px';
    } else {
        const availableHeight = window.innerHeight - padding;
        const maxHeight = Math.min(sourceHeight, availableHeight * maxScreenPercent);
        const safeMaxWidth = window.innerWidth - padding;
        
        mediaElement.style.width = 'auto';
        mediaElement.style.height = maxHeight + 'px';
        mediaElement.style.maxWidth = safeMaxWidth + 'px';
        mediaElement.style.maxHeight = maxHeight + 'px';
    }
}

// Helper function to apply natural dimensions with screen limit
function applyNaturalDimensions(mediaElement, naturalDimensions) {
    const { width: naturalWidth, height: naturalHeight } = naturalDimensions;
    if (naturalWidth && naturalHeight) {
        const maxDims = getMaxDimensions(naturalWidth, naturalHeight);
        setElementDimensions(mediaElement, maxDims.width, maxDims.height);
    }
}

// Helper function to create media element based on type
function createMediaElement(overlaySource, isVideo, isHtml, sourceMuted = false) {
    let mediaElement;
    
    if (isVideo) {
        mediaElement = document.createElement('video');
        mediaElement.src = overlaySource;
        mediaElement.controls = false;
        mediaElement.autoplay = true;
        mediaElement.muted = sourceMuted;
        mediaElement.loop = false;
    } else if (isHtml) {
        mediaElement = document.createElement('iframe');
        mediaElement.src = overlaySource;
        mediaElement.frameBorder = '0';
        mediaElement.allowFullscreen = true;
        mediaElement.style.border = 'none';
        mediaElement.style.background = 'transparent';
    } else {
        mediaElement = document.createElement('img');
        mediaElement.src = overlaySource;
    }
    
    mediaElement.className = 'overlay-media';
    return mediaElement;
}

// Helper function to setup progress bar for videos with screen boundary protection
function setupProgressBar(mediaElement, durationOverride) {
    DOMElements.progressContainer.style.display = 'block';
    DOMElements.progressBar.style.width = '0%';
    
    // Ensure progress container doesn't exceed safe boundaries
    const padding = config.display.viewportPadding * 2;
    const maxProgressWidth = window.innerWidth - padding;
    DOMElements.progressContainer.style.maxWidth = maxProgressWidth + 'px';
    DOMElements.progressContainer.style.width = '100%';
    DOMElements.progressContainer.style.boxSizing = 'border-box';
    
    console.log('Progress bar max width set to:', maxProgressWidth);

    if (durationOverride) {
        // Use duration override for progress calculation
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / durationOverride) * 100, 100);
            DOMElements.progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, config.timing.progressUpdateInterval);
        
        setTimeout(hideCustomOverlay, durationOverride);
    } else {
        // Use natural video duration for progress
        mediaElement.addEventListener('timeupdate', () => {
            if (mediaElement.duration) {
                const progress = (mediaElement.currentTime / mediaElement.duration) * 100;
                DOMElements.progressBar.style.width = progress + '%';
            }
        });
        
        mediaElement.addEventListener('ended', hideCustomOverlay);
    }
}

// Helper function to setup timing for different media types
function setupMediaTiming(mediaElement, isVideo, isGif, isHtml, durationOverride, overlaySource) {
    if (isVideo) {
        setupProgressBar(mediaElement, durationOverride);
    } else if (isHtml) {
        // Hide progress bar for HTML content
        DOMElements.progressContainer.style.display = 'none';
        
        if (durationOverride) {
            setTimeout(hideCustomOverlay, durationOverride);
        } else {
            console.warn('HTML content requires source_duration to be specified, using default duration');
            setTimeout(hideCustomOverlay, config.timing.defaultHtmlDuration);
        }
    } else {
        // Hide progress bar for images
        DOMElements.progressContainer.style.display = 'none';
        
        // Handle timing - duration override takes priority
        if (durationOverride) {
            setTimeout(hideCustomOverlay, durationOverride);
        } else if (isGif) {
            // For GIFs, try to calculate duration and wait for completion
            getGifDuration(overlaySource).then(duration => {
                console.log('Calculated GIF duration:', duration);
                if (duration === 0) {
                    duration = config.timing.defaultImageDuration;
                }
                setTimeout(hideCustomOverlay, duration);
            }).catch(() => {
                setTimeout(hideCustomOverlay, config.timing.defaultImageDuration);
            });
        } else {
            // Auto-hide static image overlay after default duration
            setTimeout(hideCustomOverlay, config.timing.defaultImageDuration);
        }
    }
}

// Helper function to setup overlay text with screen boundary protection
function setupOverlayText(textContent) {
    if (textContent) {
        DOMElements.overlayText.textContent = textContent;
        DOMElements.overlayText.hidden = false;
        
        // Ensure text doesn't exceed safe boundaries
        const padding = config.display.viewportPadding * 2;
        const maxTextWidth = (window.innerWidth - padding) * (config.display.maxTextWidth / 100);
        const maxTextHeight = (window.innerHeight - padding) * 0.3; // Max 30% of screen height for text
        
        DOMElements.overlayText.style.maxWidth = maxTextWidth + 'px';
        DOMElements.overlayText.style.maxHeight = maxTextHeight + 'px';
        DOMElements.overlayText.style.overflow = 'hidden';
        DOMElements.overlayText.style.textOverflow = 'ellipsis';
        
        console.log('Text bounds set to:', maxTextWidth + 'x' + maxTextHeight);
    } else {
        DOMElements.overlayText.textContent = '';
        DOMElements.overlayText.hidden = true;
    }
}

// Helper function to finalize media setup
function finalizeMediaSetup(mediaElement, overlaySource, overlayTextContent) {
    mediaElement.className = 'overlay-media';
    mediaElement.onerror = () => {
        console.error('Failed to load media:', overlaySource);
        hideCustomOverlay();
    };

    DOMElements.overlayMediaContainer.appendChild(mediaElement);
    setupOverlayText(overlayTextContent);
    DOMElements.overlay.classList.add('show');
}

// Helper function to cleanup overlay elements and prevent memory leaks
function cleanupOverlay() {
    const { overlay, overlayMediaContainer, overlayText, progressContainer, progressBar } = DOMElements;
    
    overlay.classList.remove('show');
    
    // Clean up media elements and their event listeners
    const mediaElements = overlayMediaContainer.querySelectorAll('video, img, iframe');
    mediaElements.forEach(element => {
        // Remove all event listeners by cloning element
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // Stop video playback if applicable
        if (element.tagName === 'VIDEO') {
            element.pause();
            element.removeAttribute('src');
            element.load();
        }
    });
    
    overlayMediaContainer.innerHTML = '';
    overlayText.textContent = '';
    overlayText.hidden = true;
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
}

// Helper function to schedule reconnection attempt
function scheduleReconnection() {
    setTimeout(connectToStreamerBot, config.websocket.reconnectionDelay);
}

// Application state management
const AppState = {
    client: null,
    isConnected: false,
    overlayQueue: [],
    isOverlayActive: false,
    
    // State getters with validation
    getClient() { return this.client; },
    isClientConnected() { return this.isConnected && this.client !== null; },
    getQueueLength() { return this.overlayQueue.length; },
    isOverlayCurrentlyActive() { return this.isOverlayActive; },
    
    // Safe state mutations
    setClient(client) { this.client = client; },
    setConnected(connected) { this.isConnected = Boolean(connected); },
    addToQueue(event) { this.overlayQueue.push(event); },
    removeFromQueue() { return this.overlayQueue.shift(); },
    clearQueue() { this.overlayQueue = []; },
    setOverlayActive(active) { this.isOverlayActive = Boolean(active); }
};

// DOM element cache - initialized after DOM ready
const DOMElements = {
    statusElement: null,
    overlay: null,
    overlayMediaContainer: null,
    overlayText: null,
    progressContainer: null,
    progressBar: null,
    
    // Initialize DOM cache safely
    init() {
        this.statusElement = document.getElementById('status');
        this.overlay = document.getElementById('overlay');
        this.overlayMediaContainer = document.getElementById('overlay-media-container');
        this.overlayText = document.getElementById('overlay-text');
        this.progressContainer = document.getElementById('progress-container');
        this.progressBar = document.getElementById('progress-bar');
        
        // Validate all elements exist
        const missing = Object.entries(this).filter(([key, value]) => 
            key !== 'init' && value === null
        ).map(([key]) => key);
        
        if (missing.length > 0) {
            throw new Error(`Missing DOM elements: ${missing.join(', ')}`);
        }
        
        return true;
    }
};

function connectToStreamerBot() {
    try {
        // Create Streamer.bot client connection
        const client = new StreamerbotClient({
            host: config.websocket.host,
            port: config.websocket.port,
            path: config.websocket.path,
            password: config.websocket.password,

            onConnect: (data) => {
                console.log('Connected to Streamer.bot:', data);
                AppState.setConnected(true);
                updateConnectionStatus();
            },

            onDisconnect: () => {
                console.log('Disconnected from Streamer.bot');
                AppState.setConnected(false);
                updateConnectionStatus();
                scheduleReconnection();
            },
        });

        // Set client in state management
        AppState.setClient(client);

        // Event handlers for different Streamer.bot events
        client.on('Custom.Event', (data) => {
            console.log('Streamer.bot Event:', data);
            handleStreamerBotEvent(data.data.eventName, data.data);
        });

    } catch (error) {
        console.error('Error creating Streamer.bot client:', error);
        scheduleReconnection();
    }
}

function updateConnectionStatus() {
    const { statusElement } = DOMElements;
    
    if (AppState.isClientConnected()) {
        statusElement.textContent = 'Connected';
        statusElement.className = 'status connected';
        statusElement.style.opacity = '1';

        // Fade out after configured delay
        setTimeout(() => {
            statusElement.style.opacity = '0';
        }, config.timing.statusFadeDelay);
    } else {
        statusElement.textContent = 'Disconnected';
        statusElement.className = 'status disconnected';
        statusElement.style.opacity = '1';
    }
}

function handleStreamerBotEvent(eventType, eventData) {
    if (eventType === 'SquidCustomOverlay') {
        queueOverlayEvent(eventData);
    }
}

function queueOverlayEvent(eventData) {
    console.log('Queueing overlay event:', eventData);
    AppState.addToQueue(eventData);
    console.log(`Queue length: ${AppState.getQueueLength()}`);
    
    // If no overlay is currently active, process the queue
    if (!AppState.isOverlayCurrentlyActive()) {
        processNextOverlay();
    }
}

function processNextOverlay() {
    if (AppState.getQueueLength() === 0) {
        console.log('Queue is empty');
        return;
    }

    if (AppState.isOverlayCurrentlyActive()) {
        console.log('Overlay is currently active, waiting...');
        return;
    }

    const nextEvent = AppState.removeFromQueue();
    console.log(`Processing next overlay event (${AppState.getQueueLength()} remaining in queue):`, nextEvent);
    showCustomOverlay(nextEvent);
}

function showCustomOverlay(eventData) {
    console.log('Showing custom overlay with data:', eventData);
    
    try {
        // Validate eventData structure
        if (!eventData || typeof eventData !== 'object') {
            throw new Error('Invalid event data structure');
        }
        
        AppState.setOverlayActive(true);

    // Get the overlay source and text from the event data
    let overlaySource = eventData.args?.overlay_source;
    const overlayTextContent = eventData.args?.overlay_text || '';
    const sourceWidth = eventData.args?.source_width;
    const sourceHeight = eventData.args?.source_height;
    const durationOverride = eventData.args?.source_duration; // in milliseconds
    
    // Parse source_muted from various string formats to boolean
    let sourceMuted = false;
    if (eventData.args?.source_muted !== undefined) {
        const mutedValue = String(eventData.args.source_muted).toLowerCase().trim();
        sourceMuted = mutedValue === 'true' || mutedValue === 'yes' || mutedValue === '1';
    }

    console.log('Overlay source:', overlaySource);
    console.log('Overlay text:', overlayTextContent);
    console.log('Source dimensions:', sourceWidth, 'x', sourceHeight);
    console.log('Duration override:', durationOverride);
    console.log('Source muted:', sourceMuted);

    if (!overlaySource) {
        console.warn('No overlay_source provided in event data');
        isOverlayActive = false;
        processNextOverlay(); // Try next item in queue
        return;
    }

    // Check if overlaySource is a URL (has protocol) or a local file path
    const isUrl = /^(https?|ftp|file|data|blob):/i.test(overlaySource);
    if (!isUrl) {
        overlaySource = 'http://absolute/' + overlaySource;
        console.log('Converted local file path to:', overlaySource);
    } else {
        console.log('Using URL as provided:', overlaySource);
    }

    // Clear previous media
    DOMElements.overlayMediaContainer.innerHTML = '';

    // Determine media type based on file extension
    const isVideo = /\.(mp4|webm|ogg|avi|mov)$/i.test(overlaySource);
    const isGif = /\.gif$/i.test(overlaySource);
    const isHtml = /\.html?$/i.test(overlaySource);

    // Create media element based on type
    let mediaElement = createMediaElement(overlaySource, isVideo, isHtml, sourceMuted);
    
    // Apply dimensions based on provided parameters
    applyMediaDimensions(mediaElement, sourceWidth, sourceHeight);
    
    // Handle natural dimensions for videos and images when no custom dimensions provided
    if (!sourceWidth && !sourceHeight) {
        if (isVideo) {
            mediaElement.addEventListener('loadedmetadata', () => {
                const naturalDimensions = {
                    width: mediaElement.videoWidth,
                    height: mediaElement.videoHeight
                };
                console.log('Video natural dimensions:', naturalDimensions.width, 'x', naturalDimensions.height);
                applyNaturalDimensions(mediaElement, naturalDimensions);
            });
        } else if (!isHtml) {
            mediaElement.addEventListener('load', () => {
                const naturalDimensions = {
                    width: mediaElement.naturalWidth,
                    height: mediaElement.naturalHeight
                };
                console.log('Image natural dimensions:', naturalDimensions.width, 'x', naturalDimensions.height);
                applyNaturalDimensions(mediaElement, naturalDimensions);
            });
        } else {
            // For HTML content with no dimensions, use safe screen boundaries
            const maxScreenPercent = config.display.maxScreenPercentage / 100;
            const padding = config.display.viewportPadding * 2;
            const safeWidth = (window.innerWidth - padding) * maxScreenPercent;
            const safeHeight = (window.innerHeight - padding) * maxScreenPercent;
            setElementDimensions(mediaElement, safeWidth, safeHeight);
        }
    }
    
        // Setup timing for different media types
        setupMediaTiming(mediaElement, isVideo, isGif, isHtml, durationOverride, overlaySource);
        finalizeMediaSetup(mediaElement, overlaySource, overlayTextContent);
        
    } catch (error) {
        console.error('Error showing overlay:', error);
        AppState.setOverlayActive(false);
        
        // Attempt to recover by processing next item in queue
        setTimeout(() => {
            processNextOverlay();
        }, config.queue.processingDelay);
    }
}

function hideCustomOverlay() {
    try {
        cleanupOverlay();
        AppState.setOverlayActive(false);
        
        // Process next overlay in queue after configured delay
        setTimeout(processNextOverlay, config.queue.processingDelay);
    } catch (error) {
        console.error('Error hiding overlay:', error);
        // Ensure state is reset even if cleanup fails
        AppState.setOverlayActive(false);
    }
}

// Function to calculate GIF duration
async function getGifDuration(gifUrl) {
    try {
        const response = await fetch(gifUrl);
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        let duration = 0;
        let index = 0;

        // Check if it's a valid GIF
        if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
            throw new Error('Not a valid GIF');
        }

        // Skip header
        index = 13;

        // Parse frames
        while (index < bytes.length) {
            if (bytes[index] === 0x21 && bytes[index + 1] === 0xF9) {
                // Graphic Control Extension
                const delay = bytes[index + 4] | (bytes[index + 5] << 8);
                duration += delay * 10; // Convert to milliseconds
                index += 8;
            } else if (bytes[index] === 0x2C) {
                // Image descriptor
                index += 10;
                // Skip image data
                while (index < bytes.length && bytes[index] !== 0x00) {
                    const blockSize = bytes[index];
                    index += blockSize + 1;
                }
                index++;
            } else if (bytes[index] === 0x3B) {
                // End of file
                break;
            } else {
                index++;
            }
        }

        return duration;
    } catch (error) {
        console.warn('Could not parse GIF duration:', error);
        return 0;
    }
}

// Handle window resize to maintain safe boundaries
window.addEventListener('resize', () => {
    if (isOverlayActive) {
        console.log('Window resized, checking overlay bounds...');
        // Re-validate current overlay dimensions if active
        const currentMedia = document.querySelector('.overlay-media');
        if (currentMedia) {
            const currentWidth = parseInt(currentMedia.style.width) || currentMedia.offsetWidth;
            const currentHeight = parseInt(currentMedia.style.height) || currentMedia.offsetHeight;
            const safeDims = validateDimensions(currentWidth, currentHeight);
            
            if (safeDims.width !== currentWidth || safeDims.height !== currentHeight) {
                setElementDimensions(currentMedia, safeDims.width, safeDims.height);
                console.log('Overlay dimensions adjusted for new screen size');
            }
        }
    }
});

// Initialize application when DOM is ready
window.addEventListener('load', function() {
    try {
        // Initialize DOM elements first
        DOMElements.init();
        console.log('DOM elements initialized successfully');
        
        // Start WebSocket connection
        console.log(`Starting connection to Streamer.bot at ${config.websocket.host}:${config.websocket.port}${config.websocket.path}...`);
        connectToStreamerBot();
        
    } catch (error) {
        console.error('Failed to initialize overlay application:', error);
        // Display error to user
        document.body.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h2>Overlay Initialization Failed</h2>
                <p>Error: ${error.message}</p>
                <p>Please check the browser console for more details.</p>
            </div>
        `;
    }
});

// Expose functions globally for console testing
window.streamerBot = {
    client: () => AppState.getClient(),
    isConnected: () => AppState.isClientConnected(),
    queueLength: () => AppState.getQueueLength(),
    clearQueue: () => { 
        AppState.clearQueue(); 
        console.log('Queue cleared'); 
    },
    isActive: () => AppState.isOverlayCurrentlyActive(),
    validateScreenBounds: () => {
        const padding = config.display.viewportPadding * 2;
        return {
            safeWidth: window.innerWidth - padding,
            safeHeight: window.innerHeight - padding,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
        };
    }
};
