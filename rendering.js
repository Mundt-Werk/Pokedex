// ===== POKEMON RENDERING AND POPUP SYSTEM =====
// Handles the visual representation of Pokémon cards and detailed popup views

// ===== MAIN POKEMON GRID RENDERING =====
/**
 * Renders the main Pokémon grid (legacy function - kept for compatibility)
 * Note: Main rendering is now handled by renderPokemon() in script.js
 */
function renderPokemon() {
    renderedPokemons = foundedPokemons;
    const card = document.getElementById('main_container');
    card.innerHTML = '';

    // Render up to the maximum number of Pokémon to show
    for (let i = 0; i < showMaxPokemons; i++) {
        const pokemons = foundedPokemons[i];
        
        // Extract Pokémon data from API response
        const name = pokemons['species']['name'];
        const pokemonImage = pokemons['sprites']['other']['official-artwork']['front_default'];
        const type1 = pokemons['types'][0]['type']['name'];
        const type2 = pokemons['types'][1] ? pokemons['types'][1]['type']['name'] : null;
        const pokemonId = pokemons['id'];

        // Generate and insert Pokémon card HTML
        const pokemonCardHTML = createPokemonCard(i, name, pokemonImage, type1, type2, pokemonId);
        card.innerHTML += pokemonCardHTML;
    }
}

// ===== POKEMON CARD CREATION =====
/**
 * Creates HTML for individual Pokémon cards in the grid
 * @param {number} i - Index of the Pokémon in the array
 * @param {string} name - Pokémon name
 * @param {string} pokemonImage - URL to Pokémon artwork image
 * @param {string} type1 - Primary Pokémon type
 * @param {string} type2 - Secondary Pokémon type (can be null)
 * @param {number} pokemonId - Unique Pokémon ID
 * @returns {string} HTML string for the Pokémon card
 */
function createPokemonCard(i, name, pokemonImage, type1, type2, pokemonId) {
    // Get background image based on primary type
    let backgroundImage = backgroundType(type1);

    return `
    <div onclick="openBigCartById('${pokemonId}')" data-pokemon-id="${pokemonId}" class="small-cart" style="background-image: ${backgroundImage};">
        <div class="small-cart-name">
            <h3>${name}</h3>
        </div>
        <div class="small-cart-type-and-image">
            <div class="small-cart-type">
                <h4>${type1}</h4>
                ${type2Check(type2)}
            </div>
            <div class="small-cart-image">
                <img src="${pokemonImage}" alt="${name}">
            </div>
        </div>
    </div>
    `;
}

// ===== LEGACY POPUP FUNCTION =====
/**
 * Legacy function for opening Pokémon popup (kept for compatibility)
 * @param {HTMLElement} element - The clicked element
 */
function openBigCart(element) {
    // Get Pokémon index from element attribute
    const index = element.getAttribute('data-index');
    const pokemon = foundedPokemons[index];

    // Extract Pokémon data
    let name = pokemon['species']['name'];
    let pokemonImage = pokemon['sprites']['other']['official-artwork']['front_default'];
    let type1 = pokemon['types'][0]['type']['name'];
    let type2 = pokemon['types'][1] ? pokemon['types'][1]['type']['name'] : null;
    
    // Generate popup content
    const popupContent = generatePopupContent(index, name, pokemonImage, type1, type2);
    
    // Display popup
    const container = document.getElementById('big_card_container');
    container.innerHTML = popupContent;
    container.classList.remove('d-none');
    document.getElementById('body').classList.add('overflow-hidden');
}

// ===== POPUP CONTENT GENERATION =====
/**
 * Generates comprehensive HTML content for the Pokémon detail popup
 * @param {number} i - Index of the Pokémon
 * @param {string} name - Pokémon name
 * @param {string} pokemonImage - URL to Pokémon artwork
 * @param {string} type1 - Primary Pokémon type
 * @param {string} type2 - Secondary Pokémon type (can be null)
 * @returns {string} Complete HTML string for popup content
 */
function generatePopupContent(i, name, pokemonImage, type1, type2) {
    const pokemons = foundedPokemons[i];
    
    // Extract physical characteristics
    const weight = pokemons['weight'];
    const height = pokemons['height'];
    const abilitiesString = generateAbilitiesString(pokemons);

    // Extract base stats for battle calculations
    const hp = pokemons['stats'][0]['base_stat'];
    const attack = pokemons['stats'][1]['base_stat'];
    const defense = pokemons['stats'][2]['base_stat'];
    const spAtk = pokemons['stats'][3]['base_stat'];
    const spDef = pokemons['stats'][4]['base_stat'];
    const speed = pokemons['stats'][5]['base_stat'];

    // Calculate total base stat value
    const total = hp + attack + defense + spAtk + spDef + speed;
    
    // Get background image for popup theme
    let backgroundImage = backgroundType(type1);

    return `
        <div onclick="doNotClose(event)" class="big-card" style="background-image: ${backgroundImage};">
            <h3>${name}</h3>
                <div class="type-of">
                    <h4>${type1}</h4>
                    ${type2Check(type2)}
                </div>     

            <div class="info">
                <img src="${pokemonImage}" alt="">
            
                <div class="info-menu">
                    <p id="menu1" onclick="openAboutStats()" class="bold">About</p>
                    <p id="menu2" onclick="openBaseStats()" class="bold unselect-color">Base Stats</p>
                </div>

                <div id="about" onclick="openAbout()" class="about">
                    <div>
                        <p>Species</p>
                        <p>Height</p>
                        <p>Weight</p>
                        <p>Abilities</p>
                    </div>
                    <div>
                        <p class="bold">${type1} ${type2CheckBigCart(type2)}</p>
                        <p class="bold">${height} cm</p>
                        <p class="bold">${weight} kg</p>
                        <p class="bold">${abilitiesString}</p>
                    </div>
                </div>

                <div id="base_stats" class="base-stats d-none">
                    <div>
                        <p>HP</p>
                        <p>Attack</p>
                        <p>Defense</p>
                        <p>Sp. Atk</p>
                        <p>Sp. Def</p>
                        <p>Speed</p>
                        <p>Total</p>
                    </div>
                    <div>
                        <p class="bold">${hp}</p>
                        <p class="bold">${attack}</p>
                        <p class="bold">${defense}</p>
                        <p class="bold">${spAtk}</p>
                        <p class="bold">${spDef}</p>
                        <p class="bold">${speed}</p>
                        <p class="bold">${total}</p>
                    </div>
                    <div class="bars">
                        <div class="bar" style="width: ${hp}px;"></div>
                        <div class="bar" style="width: ${attack}px;"></div>
                        <div class="bar" style="width: ${defense}px;"></div>
                        <div class="bar" style="width: ${spAtk}px;"></div>
                        <div class="bar" style="width: ${spDef}px;"></div>
                        <div class="bar" style="width: ${speed}px;"></div>
                        <div class="bar" style="opacity: 0;"></div>        
                    </div>
                </div>
            </div>
        </div>
        <div onclick="doNotClose(event)" class="left-right"> 
            <img onclick="previousPopup(this)" data-index="${i}" src="./img/icons/arrow-left-circle.svg" alt="">
            <img onclick="closeBigCart()" src="./img/icons/x-circle.svg" alt="">
            <img onclick="nextPopup(this)" data-index="${i}" src="./img/icons/arrow-right-circle.svg" alt="">
        </div>
    `;
}

// ===== UTILITY FUNCTIONS FOR POPUP CONTENT =====
/**
 * Generates a formatted string of Pokémon abilities
 * @param {Object} pokemon - Complete Pokémon data object
 * @returns {string} Comma-separated list of abilities
 */
function generateAbilitiesString(pokemon) {
    let abilitiesString = '';
    const abilities = pokemon['abilities'];
  
    if (abilities.length > 0) {
        // Add first ability
        abilitiesString += abilities[0]['ability']['name'];
  
        // Add second ability with comma separator
        if (abilities.length > 1) {
            abilitiesString += `, ${abilities[1]['ability']['name']}`;
        }
  
        // Add third ability with "and" connector
        if (abilities.length > 2) {
            abilitiesString += ` and ${abilities[2]['ability']['name']}`;
        }
    }
  
    return abilitiesString;
}

/**
 * Checks if secondary type exists and returns HTML
 * @param {string|null} type2 - Secondary Pokémon type
 * @returns {string} HTML for secondary type or empty string
 */
function type2Check(type2) {
    if (type2) {
        return `<h4>${type2}</h4>`;
    }
    return '';
}

/**
 * Formats secondary type for display in popup "About" section
 * @param {string|null} type2 - Secondary Pokémon type
 * @returns {string} Formatted type string with "and" prefix
 */
function type2CheckBigCart(type2){
    if (type2) {
        return `and ${type2}`;
    }
    return '';
}

/**
 * Legacy function for formatting third ability (kept for compatibility)
 * @param {string|null} abilities3 - Third ability name
 * @returns {string} Formatted ability string with "and" prefix
 */
function ability2CheckBigCart(abilities3){
    if (abilities3) {
        return `and ${abilities3}`;
    }
    return '';
}