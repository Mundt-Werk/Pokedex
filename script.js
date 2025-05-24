// ===== POKEMON POKEDEX APPLICATION - MAIN SCRIPT =====
// A modern, responsive Pokédex application with progressive loading and smart navigation

// ===== GLOBAL VARIABLES =====
let showMaxPokemons = 30;           // Maximum number of Pokémon to display initially
let foundedPokemons = [];           // Array storing all loaded Pokémon data
let pokeStats = [];                 // Array for Pokémon statistics (legacy)
let pokeStatsName = [];            // Array for Pokémon stat names (legacy)
let moveAttack = [];               // Array for move attacks (legacy)
let filteredPokemons = [];         // Array storing filtered search results
let renderedPokemons = [];         // Array storing currently rendered Pokémon
let filterActive = false;          // Boolean flag indicating if search filter is active
let isLoading = false;             // Boolean flag preventing multiple simultaneous API calls

// ===== POPUP STATE MANAGEMENT =====
let currentPopupTab = 'about';     // Remembers which tab (about/stats) was last selected

// ===== APPLICATION INITIALIZATION =====
/**
 * Main initialization function called when the page loads
 * Implements minimum loading time for better UX
 */
async function init() {
    showLoadingOverlay();
    
    // Track loading time to ensure minimum display duration
    const startTime = Date.now();
    const minLoadTime = 2500; // Minimum 2.5 seconds loading screen
    
    try {
        // Load initial Pokémon data
        await foundAllPokemon();
        
        // Calculate remaining time to reach minimum loading duration
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);
        
        // Wait for remaining time if loading was too fast
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        // Render initial Pokémon grid
        renderPokemon();
        
        // Hide loading screen with smooth animation
        hideLoadingOverlay();
        
        // Setup search functionality
        document.getElementById('search').addEventListener('input', filterPokemon);
        
    } catch (error) {
        console.error('Error during initialization:', error);
        showLoadingError();
    }
}

// ===== LOADING SCREEN MANAGEMENT =====
/**
 * Shows the loading overlay with animated text
 */
function showLoadingOverlay() {
    const loadingScreen = document.getElementById('loading_screen');
    loadingScreen.classList.remove('d-none');
    updateLoadingText();
}

/**
 * Hides the loading overlay with smooth fade-out animation
 */
function hideLoadingOverlay() {
    const loadingScreen = document.getElementById('loading_screen');
    
    // Apply fade-out transition
    loadingScreen.style.transition = 'opacity 0.5s ease-out';
    loadingScreen.style.opacity = '0';
    
    // Remove overlay after animation completes
    setTimeout(() => {
        loadingScreen.classList.add('d-none');
        loadingScreen.style.opacity = '1'; // Reset for next use
    }, 500);
}

/**
 * Adds animated "Loading Pokémon..." text to the loading screen
 */
function updateLoadingText() {
    const loadingScreen = document.getElementById('loading_screen');
    const existingText = loadingScreen.querySelector('.loading-text');
    
    // Only add text if it doesn't already exist
    if (!existingText) {
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.style.cssText = `
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-top: 20px;
            text-align: center;
            animation: pulse 1.5s ease-in-out infinite;
        `;
        loadingScreen.appendChild(loadingText);
    }
}

/**
 * Displays error screen when loading fails
 */
function showLoadingError() {
    const loadingScreen = document.getElementById('loading_screen');
    const errorHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #e74c3c;
            font-size: 24px;
            text-align: center;
        ">
            <h2>⚠️ Loading Error</h2>
            <p style="margin: 20px 0; font-size: 18px;">
                Could not load Pokémon data. Please check your internet connection.
            </p>
            <button onclick="location.reload()" style="
                padding: 12px 24px;
                font-size: 18px;
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            ">
                Try Again
            </button>
        </div>
    `;
    loadingScreen.innerHTML = errorHTML;
}

// ===== POKEMON DATA LOADING =====
/**
 * Loads initial 30 Pokémon from the PokéAPI
 * Uses progressive loading approach for better performance
 */
async function foundAllPokemon() {
    for (let i = 1; i <= 30; i++) {
        try {
            let url = `https://pokeapi.co/api/v2/pokemon/${i}/`;
            let response = await fetch(url);
            
            // Check if API request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let currentPokemon = await response.json();
            foundedPokemons.push(currentPokemon);
        } catch (error) {
            console.error(`Error loading Pokémon ${i}:`, error);
            // Continue loading other Pokémon even if one fails
        }
    }
}

// ===== PROGRESSIVE LOADING SYSTEM =====
/**
 * Loads additional Pokémon in batches of 30
 * Prevents multiple simultaneous API calls
 */
async function loadMorePokemon() {
    // Prevent multiple simultaneous loading operations
    if (isLoading) return;
    
    const currentCount = foundedPokemons.length;
    const maxPokemon = 1025; // Total number of Pokémon available
    
    // Check if all Pokémon are already loaded
    if (currentCount >= maxPokemon) {
        hideLoadMoreButton();
        return;
    }
    
    // Calculate how many new Pokémon to load
    const loadCount = 30;
    const newCount = Math.min(currentCount + loadCount, maxPokemon);
    
    // Set loading state and update UI
    isLoading = true;
    showLoadMoreLoading();
    
    try {
        // Load new Pokémon batch
        for (let i = currentCount + 1; i <= newCount; i++) {
            let url = `https://pokeapi.co/api/v2/pokemon/${i}/`;
            let response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let currentPokemon = await response.json();
            foundedPokemons.push(currentPokemon);
        }
        
        // Update display if no search filter is active
        if (!filterActive) {
            showMaxPokemons = foundedPokemons.length;
            renderPokemon();
        }
        
        // Hide load more button if all Pokémon are loaded
        if (foundedPokemons.length >= maxPokemon) {
            hideLoadMoreButton();
        }
        
    } catch (error) {
        console.error('Error loading additional Pokémon:', error);
        showLoadMoreError();
    } finally {
        // Reset loading state regardless of success/failure
        isLoading = false;
        hideLoadMoreLoading();
    }
}

// ===== LOAD MORE UI MANAGEMENT =====
/**
 * Shows loading state for the "Load More" button
 */
function showLoadMoreLoading() {
    const loadButton = document.getElementById('loadMoreButton');
    loadButton.textContent = 'Loading...';
    loadButton.disabled = true;
    loadButton.style.opacity = '0.7';
    updateLoadProgress();
}

/**
 * Hides loading state and restores normal "Load More" button
 */
function hideLoadMoreLoading() {
    const loadButton = document.getElementById('loadMoreButton');
    loadButton.textContent = 'Load More';
    loadButton.disabled = false;
    loadButton.style.opacity = '1';
}

/**
 * Shows error state on the "Load More" button
 */
function showLoadMoreError() {
    const loadButton = document.getElementById('loadMoreButton');
    loadButton.textContent = 'Retry';
    loadButton.style.backgroundColor = '#ff6b6b';
    
    // Reset to normal state after 3 seconds
    setTimeout(() => {
        loadButton.textContent = 'Load More';
        loadButton.style.backgroundColor = '';
    }, 3000);
}

/**
 * Hides the "Load More" button when all Pokémon are loaded
 */
function hideLoadMoreButton() {
    const loadContainer = document.querySelector('.load-more-pokemon');
    loadContainer.style.display = 'none';
    showAllLoadedMessage();
}

/**
 * Shows completion message when all Pokémon are loaded
 */
function showAllLoadedMessage() {
    const loadContainer = document.querySelector('.load-more-pokemon');
    loadContainer.innerHTML = `
        <div style="text-align: center; color: white; font-size: 24px; padding: 20px;">
            ✨ All Pokémon loaded! ✨
        </div>
    `;
    loadContainer.style.display = 'flex';
}

/**
 * Updates the "Load More" button with loading progress
 */
function updateLoadProgress() {
    const loadButton = document.getElementById('loadMoreButton');
    const current = foundedPokemons.length;
    const total = 1025;
    const percentage = Math.round((current / total) * 100);
    
    loadButton.textContent = `Loading... (${current}/${total})`;
}

// ===== POKEMON RENDERING SYSTEM =====
/**
 * Renders Pokémon cards in the main container
 * Handles both normal and filtered display modes
 */
function renderPokemon() {
    // Choose data source based on filter state
    const pokemonsToRender = filterActive ? filteredPokemons : foundedPokemons;
    renderedPokemons = pokemonsToRender;
    
    const card = document.getElementById('main_container');
    card.innerHTML = '';

    // Determine how many Pokémon to show
    const maxToShow = filterActive ? pokemonsToRender.length : Math.min(showMaxPokemons, pokemonsToRender.length);

    // Generate and insert Pokémon cards
    for (let i = 0; i < maxToShow; i++) {
        const pokemon = pokemonsToRender[i];
        if (!pokemon) continue; // Skip if Pokémon data is missing
        
        // Extract Pokémon data
        const name = pokemon.species.name;
        const pokemonImage = pokemon.sprites.other['official-artwork'].front_default;
        const type1 = pokemon.types[0].type.name;
        const type2 = pokemon.types[1] ? pokemon.types[1].type.name : null;
        const pokemonId = pokemon.id;

        // Create and insert Pokémon card HTML
        const pokemonCardHTML = createPokemonCard(i, name, pokemonImage, type1, type2, pokemonId);
        card.innerHTML += pokemonCardHTML;
    }
    
    // Update "Load More" button visibility
    updateLoadMoreVisibility();
}

/**
 * Controls visibility of the "Load More" button based on current state
 */
function updateLoadMoreVisibility() {
    const loadContainer = document.querySelector('.load-more-pokemon');
    
    if (filterActive) {
        // Hide "Load More" when search is active
        loadContainer.classList.add('hidden');
    } else {
        // Show "Load More" if more Pokémon are available
        const hasMore = foundedPokemons.length < 1025 || showMaxPokemons < foundedPokemons.length;
        
        if (hasMore) {
            loadContainer.classList.remove('hidden');
            loadContainer.style.display = 'flex';
        } else {
            hideLoadMoreButton();
        }
    }
}

// ===== POPUP NAVIGATION WITH STATE MEMORY =====
/**
 * Navigates to the next Pokémon in the popup
 * Maintains the current tab selection (About/Stats)
 */
function nextPopup(element) {
    let currentIndex = parseInt(element.getAttribute('data-index'), 10);
    let nextIndex = currentIndex + 1;
    
    // Loop back to first Pokémon if at the end
    if (nextIndex >= renderedPokemons.length) {
        nextIndex = 0; 
    }
    
    const nextPokemonId = renderedPokemons[nextIndex].id;
    openBigCartById(nextPokemonId.toString()); 
}

/**
 * Navigates to the previous Pokémon in the popup
 * Maintains the current tab selection (About/Stats)
 */
function previousPopup(element) {
    let currentIndex = parseInt(element.getAttribute('data-index'), 10);
    let prevIndex = currentIndex - 1;
    
    // Loop to last Pokémon if at the beginning
    if (prevIndex < 0) {
        prevIndex = renderedPokemons.length - 1; 
    }
    
    const prevPokemonId = renderedPokemons[prevIndex].id;
    openBigCartById(prevPokemonId.toString()); 
}

/**
 * Opens the detailed Pokémon popup by ID
 * Key feature: Remembers and restores the last selected tab (About/Stats)
 */
function openBigCartById(pokemonId) {
    pokemonId = parseInt(pokemonId, 10); 
    const pokemon = foundedPokemons.find(p => p.id === pokemonId);
    
    // Validate Pokémon exists
    if (!pokemon) {
        console.error('Pokémon not found');
        return;
    }

    // Extract Pokémon data for popup
    let name = pokemon.species.name;
    let pokemonImage = pokemon.sprites.other["official-artwork"].front_default;
    let type1 = pokemon.types[0].type.name;
    let type2 = pokemon.types[1] ? pokemon.types[1].type.name : null;

    // Find current index in rendered array for navigation
    const currentIndex = renderedPokemons.findIndex(p => p.id === pokemonId);
    const popupContent = generatePopupContent(currentIndex, name, pokemonImage, type1, type2);

    // Display popup
    const container = document.getElementById('big_card_container');
    container.innerHTML = popupContent;
    container.classList.remove('d-none');
    document.getElementById('body').classList.add('overflow-hidden');

    // ===== SMART TAB RESTORATION =====
    // Restore the last selected tab instead of always defaulting to "About"
    if (currentPopupTab === 'stats') {
        openBaseStats();
    } else {
        openAboutStats();
    }

    // Update navigation arrow data attributes
    const leftArrow = document.querySelector('.left-right img[onclick^="previousPopup"]');
    const rightArrow = document.querySelector('.left-right img[onclick^="nextPopup"]');
    if (leftArrow) leftArrow.setAttribute('data-index', currentIndex);
    if (rightArrow) rightArrow.setAttribute('data-index', currentIndex);
}

/**
 * Closes the Pokémon popup and restores normal page state
 * Resets tab selection to "About" for fresh start
 */
function closeBigCart() {
    document.getElementById('big_card_container').classList.add('d-none');
    document.getElementById('body').classList.remove('overflow-hidden');
    
    // Reset tab selection to "About" when popup is closed
    currentPopupTab = 'about'; 
}

// ===== POPUP TAB MANAGEMENT WITH STATE MEMORY =====
/**
 * Switches to the "About" tab in the Pokémon popup
 * Saves this preference for navigation between Pokémon
 */
function openAboutStats(){
    // Save current tab state for future navigation
    currentPopupTab = 'about';
    
    // Update UI elements
    document.getElementById('about').classList.remove('d-none');
    document.getElementById('base_stats').classList.add('d-none');
    document.getElementById('menu1').classList.remove('unselect-color');
    document.getElementById('menu2').classList.add('unselect-color');
    
    console.log('Switched to About tab'); // Debug logging
}

/**
 * Switches to the "Base Stats" tab in the Pokémon popup
 * Saves this preference for navigation between Pokémon
 */
function openBaseStats(){
    // Save current tab state for future navigation
    currentPopupTab = 'stats';
    
    // Update UI elements
    document.getElementById('base_stats').classList.remove('d-none');
    document.getElementById('about').classList.add('d-none');
    document.getElementById('menu2').classList.remove('unselect-color');
    document.getElementById('menu1').classList.add('unselect-color');
    
    console.log('Switched to Base Stats tab'); // Debug logging
}

/**
 * Prevents event bubbling when clicking inside the popup
 * Ensures popup doesn't close when interacting with content
 */
function doNotClose(event){
    event.stopPropagation();
}

// ===== UTILITY FUNCTIONS =====
/**
 * Generates CSS background image URL based on Pokémon type
 * @param {string} type - The Pokémon type (e.g., 'fire', 'water')
 * @returns {string} CSS url() value for background image
 */
function backgroundType(type) {
    const imagePath = `./img/cards/${type.toLowerCase()}.png`;
    return `url(${imagePath})`;
}

// ===== STATE MANAGEMENT HELPERS =====
/**
 * Gets the current popup tab state
 * @returns {string} Current tab ('about' or 'stats')
 */
function getCurrentTabState() {
    return currentPopupTab;
}

/**
 * Sets the popup tab state
 * @param {string} tabName - Tab name ('about' or 'stats')
 */
function setTabState(tabName) {
    if (tabName === 'about' || tabName === 'stats') {
        currentPopupTab = tabName;
    }
}