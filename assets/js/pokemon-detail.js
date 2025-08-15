const pokemonDetails = {}
const pokeballBackground = document.createElement('img');
const mainContent = document.getElementById('main-content')
const section = document.createElement('section');

let listItems = null;
let selectedPokemon = null;

pokeballBackground.src = "images/pokeball.png"

section.className = 'content details-content';
section.id = 'detailScreen';

pokemonDetails.openDetailsScreen = () => {
    listItems = document.getElementById('pokemonList').querySelectorAll(':scope > li');
    selectedPokemon = null;

    listItems.forEach((item, index) => {
        item.id = 'pokemon' + index;
        item.addEventListener('click', () => {
            verifyDetailsScreen(index)
            window.scrollTo(0, 0);
        })
    })
}

pokemonDetails.closeDetailsScreen = (pageChange = false) => {
    const body = document.getElementById('body')
    if (body.classList.contains('opened-pokemon-details'))
        body.classList.remove('opened-pokemon-details')

    mainContent.className = "content main-content";

    const screen = document.getElementById('detailScreen')
    if (screen != undefined)
        screen.remove()

    if (pageChange == true)
        selectedPokemon = null;
}

pokemonDetails.getDetailHtml = async (pokemon) => {
    const html =  fetch('detail.html')
        .then(response => response.text())

    await Promise.all([pokemon, html])
        .then(([pokemon, html]) => buildDetailHtml(pokemon, html))
}

function esperarCarregar(selector, callback) {
    const observer = new MutationObserver((mutations, observer) => {
        const element = document.querySelector(selector)
        if (element) {
            observer.disconnect()
            callback(element)
        }
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
}

function verifyDetailsScreen(id) {
    if (selectedPokemon != null)
        pokemonDetails.closeDetailsScreen()
    
    if (selectedPokemon != id)
        preparePokemonScreen(id)
    else
        selectedPokemon = null;
}

function preparePokemonScreen(id){
    const body = document.getElementById('body')
    if (!body.classList.contains('opened-pokemon-details'))
        body.className += " opened-pokemon-details"

    selectedPokemon = id;
    const main = document.getElementById('main')
    main.appendChild(section)

    getDetailHtmlById(id)
}

function buildDetailHtml(pokemon, html) {
    buildDetailCardHtml(pokemon, html)
    buildPokeballHtml()    
    buildPokemonTitle(pokemon)
    buildPokemonImageHtml(pokemon)
    buildShinyButton(pokemon)
    buildInfoHtml(pokemon)
    buildEntryHtml(pokemon)
    buildStatsHtml(pokemon)
    buildAbilitiesHtml(pokemon)
    buildTopGradient(pokemon)

    if (pokemon.evolutionChain.pokemons.length > 1)
        evolution.buildEvolutionsHtml(pokemon)
    if (pokemon.variations.length > 1)
        variation.buildVariationsHtml(pokemon)
}

function buildTopGradient(pokemon){
    const top = document.getElementById('top');
    
    let secondaryType = "";
    if (pokemon.types[1])
        secondaryType = `<div class="detail-gradient secondary-${pokemon.types[1]} top-left-gradient"></div>`

    top.innerHTML += secondaryType
}

function buildDetailCardHtml(pokemon, html){
    const detailScreen = document.getElementById('detailScreen');
    detailScreen.innerHTML = html;
    detailScreen.className = `content details-content ${pokemon.type}-background`;
}

function buildPokeballHtml(){
    const pokeballCard = document.getElementById('pokeball-card');
    pokeballCard.appendChild(pokeballBackground);
}

function buildPokemonTitle(pokemon){
    const pokemonTitle = document.getElementById('pokemon-title');
    pokemonTitle.innerHTML = pokemon.name;
}

function buildPokemonImageHtml(pokemon){
    const img = new Image();
    img.src = pokemon.activeImage;

    const pokemonImage = document.createElement('img')
    pokemonImage.className = 'pokemon-image';
    pokemonImage.src = img.src;

    img.onload = function(){
        const imageCard = document.getElementById('image-card');
             
        imageCard.innerHTML = '';
        imageCard.appendChild(pokemonImage)
    }
}

function buildInfoHtml(pokemon){
    const infoCard = document.getElementById("info-card")
    infoCard.innerHTML += `
        <div class="detail-types-card">  
            <div class='info-name'>TYPES</div> 
            <div class="detail-types" id="types"></div>           
        </div>
        <div class='info-card'>
            <div class='info-row'>
                <div class='info-name'>HEIGHT</div>
                <div class='info-value'>${pokemon.height}</div> 
            </div>
            <div class='info-row'>
                <div class='info-name'>WEIGHT</div>
                <div class='info-value'>${pokemon.weight}</div>     
            </div>
            <div class='info-row'>
                <div class='info-name'>CATEGORY</div>
                <div class='info-value'>${pokemon.category}</div>
            </div>
            <div class='info-row'>
                <div class='info-name'>GENDER</div>
                <div class='info-value'>${pokemon.genders}</div>
            </div>
        </div>
    `

    const typesHtml = document.getElementById("types")
    pokemon.types.forEach((type) => {
        typesHtml.innerHTML += `<div class="type ${type}">${type}</div>`
    })
}

function buildEntryHtml(pokemon){
    esperarCarregar('#select-version', (element) => {
        pokemon.gameVersions.forEach((entry) => {
            if (entry.version.name == pokemon.activeGameVersion)
                element.innerHTML += `<option selected>${entry.version.name}</option>`
            else
                element.innerHTML += `<option>${entry.version.name}</option>`
        })
        buildEntryDescriptionHtml(element, pokemon)
    })

}

function buildEntryDescriptionHtml(select, pokemon){
    esperarCarregar('#pokemon-entry', (entry) => {
        entry.innerHTML = pokemon.entry
        select.addEventListener('change', function(event) {
            const flavor_text_entry = event.target.value;
            pokemon.entry = pokemon.gameVersions.find(e => e.version.name == flavor_text_entry).flavor_text
            entry.innerHTML = pokemon.entry
        })
    })
}

function buildStatsHtml(pokemon){
    let statTotal = 0;
    const statCard = document.getElementById('stat-card');
    pokemon.stats.map((stat) => {
        let width = stat.value * 100 / 255; 
        statTotal += stat.value;

        statCard.innerHTML += `
            <li class='stat'>
                <div class='stat-name'>${stat.name}</div>
                <div class='stat-bar-background'>
                        <div class='stat-bar' style='width: ${width}%;'></div>
                    </div>
                <div class='stat-value'>${stat.value}</div>     
            </li>
            `
    })

    statCard.innerHTML += `
        <li class='stat stats-total'>
            <div class='stat-name'>Total</div>
            <div class='stat-bar-background invisible-bar'></div>
            <div class='stat-value'>${statTotal}</div>     
        </li>
    `
}

async function buildAbilitiesHtml(pokemon) {
    const descriptions = await getAbilitysDescription(pokemon.abilities)

    const abilitiesCard = document.getElementById('abilities-list');
    pokemon.abilities.map(async (ability, index) => {
        hidden = '';
        if (ability.isHidden)
            hidden = `<div class='hidden'>hidden</div>`

        abilitiesCard.innerHTML += `
            <li class='ability'>
                <div class='ability-name'>${ability.name}</div>${hidden}
                <div class='ability-info-box'>
                   ${descriptions[index]}
                </div>
            </li>
        `
    })
}

async function getAbilitysDescription(abilities){
    const descriptions = abilities.map(async (ability) => {
        const name = ability.name.replace(" ","-")
        let url = `https://pokeapi.co/api/v2/ability/${name}`
        return fetch(url)
            .then((response) => response.json())
            .then((habilidade) => 
                habilidade.effect_entries.find(h => h.language.name == 'en').effect)
    })

    let result = await Promise.all(descriptions)
    return result;
}

async function getDetailHtmlById(id){
    const pokemon = pokeApi.getPokemons(offset + id, 1)
        .then((pokemons) => pokemons[0])

    pokemonDetails.getDetailHtml(pokemon)
}

function buildShinyButton(pokemon){
    const shinySelection = document.getElementById("select-shiny")
    shinySelection.innerHTML = `
        <div class="select-option selected" id="default-option">Default</div>
        <div class="select-option" id="shiny-option">Shiny</div>
    `

    esperarCarregar('#default-option', (element) => {
        element.addEventListener('click', () => 
            changeSelectedImage(element, 'shiny-option', pokemon, pokemon.photo)
        )
    })

    esperarCarregar('#shiny-option', (element) => 
        element.addEventListener('click', () => 
            changeSelectedImage(element, 'default-option', pokemon, pokemon.shiny)
        )
    )  
}

function changeSelectedImage(element, otherOption, pokemon, image){
    if (!element.classList.contains('selected')){
        pokemon.activeImage = image;
        
        const otherButton = document.getElementById(otherOption);
        otherButton.classList.remove('selected');
        element.classList.add('selected');

        buildPokemonImageHtml(pokemon);
    }
}