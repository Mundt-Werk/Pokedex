// ===== POKEMON SEARCH AND FILTERING SYSTEM =====
// Advanced search functionality with debouncing, "no results" handling, and dynamic loading

// ===== GLOBAL VARIABLES =====
let searchTimeout; // Stores timeout ID for search debouncing

// ===== MAIN SEARCH FUNCTION =====
/**
 * Main search function with debouncing to prevent excessive API calls
 * Waits 300ms after last keystroke before executing search
 */
function filterPokemon() {
    // Clear previous timeout to prevent multiple simultaneous searches
    clearTimeout(searchTimeout);
    
    // Set new timeout for debounced search execution
    searchTimeout = setTimeout(() => {
        const searchInput = document.getElementById('search');
        const searchTerm = searchInput.value.toLowerCase().trim();

        // Execute search if user typed at least 1 character
        if (searchTerm.length >= 1) {
            handleFiltering(searchTerm);
        } else {
            // Clear search and show all Pokémon if input is empty
            handleNoFilter();
        }
    }, 300); // 300ms debounce delay
}

// ===== SEARCH EXECUTION =====
/**
 * Executes the actual filtering logic for search terms
 * @param {string} searchTerm - The search term entered by user
 */
function handleFiltering(searchTerm) {
    const loadmore = document.querySelector('.load-more-pokemon'); 

    // Handle empty search term edge case
    if (searchTerm === '') {
        handleNoFilter();
        return;
    }

    // Activate filter mode
    filterActive = true;
    
    // Filter loaded Pokémon based on name matching search term
    filteredPokemons = foundedPokemons.filter(pokemon => {
        const pokemonName = pokemon.species.name.toLowerCase();
        return pokemonName.startsWith(searchTerm); // Use startsWith for more precise matching
    });
    
    // Update rendered Pokémon array for navigation
    renderedPokemons = filteredPokemons;
    
    // Render filtered results
    renderFilteredPokemon(filteredPokemons);
    
    // Hide "Load More" button during search (search only works on loaded Pokémon)
    if (loadmore) {
        loadmore.classList.add('hidden');
        loadmore.style.display = 'none';
    }
    
    // Show "no results" message if no Pokémon match the search
    if (filteredPokemons.length === 0) {
        showNoResults(searchTerm);
    }
}

/**
 * Handles clearing of search filter and returning to normal view
 */
function handleNoFilter() {
    const loadmore = document.querySelector('.load-more-pokemon'); 
    
    // Deactivate filter mode
    filterActive = false;
    
    // Reset display limit to show all loaded Pokémon
    showMaxPokemons = Math.max(30, showMaxPokemons);
    
    // Render normal Pokémon grid
    renderPokemon();
    
    // Restore "Load More" button if more Pokémon are available
    if (loadmore) {
        loadmore.classList.remove('hidden');
        
        // Check if "Load More" button should be displayed
        if (foundedPokemons.length < 1025 || showMaxPokemons < foundedPokemons.length) {
            loadmore.style.display = 'flex';
        }
    }
    
    // Remove any "no results" messages from previous searches
    removeNoResults();
}

// ===== FILTERED RESULTS RENDERING =====
/**
 * Renders filtered Pokémon search results
 * @param {Array} filteredPokemons - Array of Pokémon matching search criteria
 */
function renderFilteredPokemon(filteredPokemons) {
    const cardContainer = document.getElementById('main_container');
    cardContainer.innerHTML = ''; // Clear existing content

    // Generate HTML for each filtered Pokémon
    filteredPokemons.forEach((pokemon, index) => {
        // Extract Pokémon data
        const name = pokemon.species.name;
        const pokemonImage = pokemon.sprites.other['official-artwork'].front_default;
        const type1 = pokemon.types[0].type.name;
        const type2 = pokemon.types[1] ? pokemon.types[1].type.name : null;
        const pokemonId = pokemon.id; 

        // Create and insert Pokémon card
        const pokemonCardHTML = createPokemonCard(index, name, pokemonImage, type1, type2, pokemonId); 
        cardContainer.innerHTML += pokemonCardHTML;
    });
    
    // Display search results count
    showSearchResults(filteredPokemons.length);
}

// ===== "NO RESULTS" HANDLING =====
/**
 * Displays "no results found" message with option to load more Pokémon
 * @param {string} searchTerm - The search term that yielded no results
 */
function showNoResults(searchTerm) {
    const cardContainer = document.getElementById('main_container');
    const noResultsHTML = `
        <div class="no-results" style="
            grid-column: 1 / -1;
            text-align: center;
            color: white;
            font-size: 24px;
            padding: 40px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            margin: 20px;
        ">
            <h3>No Pokémon found 😢</h3>
            <p style="margin-top: 16px; font-size: 18px;">
                No results for "<strong>${searchTerm}</strong>"
            </p>
            <p style="margin-top: 8px; font-size: 16px; opacity: 0.8;">
                Try a different search term or load more Pokémon.
            </p>
            ${foundedPokemons.length < 1025 ? `
                <button onclick="loadMoreAndSearch('${searchTerm}')" style="
                    margin-top: 16px;
                    padding: 8px 16px;
                    background-color: red;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    Load more Pokémon and search again
                </button>
            ` : ''}
        </div>
    `;
    cardContainer.innerHTML = noResultsHTML;
}

/**
 * Removes "no results" message from the display
 */
function removeNoResults() {
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.remove();
    }
    removeSearchResults();
}

// ===== SEARCH RESULTS UI =====
/**
 * Shows search results count in the header
 * @param {number} count - Number of Pokémon found
 */
function showSearchResults(count) {
    // Remove any existing search results info
    removeSearchResults();
    
    const header = document.querySelector('header');
    const searchResultsHTML = `
        <div class="search-results-info" style="
            color: white;
            font-size: 18px;
            text-align: center;
            padding: 8px 16px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            margin-top: 8px;
        ">
            ${count} Pokémon found
            ${foundedPokemons.length < 1025 ? ` (of ${foundedPokemons.length} loaded)` : ''}
        </div>
    `;
    header.insertAdjacentHTML('beforeend', searchResultsHTML);
}

/**
 * Removes search results info from the header
 */
function removeSearchResults() {
    const searchResults = document.querySelector('.search-results-info');
    if (searchResults) {
        searchResults.remove();
    }
}

// ===== DYNAMIC LOADING FOR SEARCH =====
/**
 * Loads more Pokémon and re-executes search
 * Called when user clicks "Load more and search again" button
 * @param {string} searchTerm - The search term to re-execute after loading
 */
async function loadMoreAndSearch(searchTerm) {
    // Get reference to the button that triggered this function
    const button = event.target;
    const originalText = button.textContent;
    
    // Show loading state
    button.textContent = 'Loading...';
    button.disabled = true;
    
    try {
        // Load additional Pokémon data
        await loadMorePokemon();
        
        // Re-execute search with new data
        handleFiltering(searchTerm);
        
    } catch (error) {
        console.error('Error loading and searching:', error);
        
        // Show error state
        button.textContent = 'Error - Try again';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }
}

// ===== ADVANCED SEARCH OPTIONS (OPTIONAL) =====
/**
 * Advanced search function that searches in multiple fields
 * @param {string} searchTerm - The search term
 * @returns {Array} Array of Pokémon matching the search criteria
 */
function advancedSearch(searchTerm) {
    return foundedPokemons.filter(pokemon => {
        const name = pokemon.species.name.toLowerCase();
        const types = pokemon.types.map(t => t.type.name.toLowerCase());
        
        // Search in Pokémon name
        if (name.includes(searchTerm)) return true;
        
        // Search in Pokémon types
        if (types.some(type => type.includes(searchTerm))) return true;
        
        // Search by ID if user entered a number
        if (!isNaN(searchTerm) && pokemon.id === parseInt(searchTerm)) return true;
        
        return false;
    });
}

// To use advanced search instead of simple name search, replace the filter in handleFiltering:
// filteredPokemons = advancedSearch(searchTerm);