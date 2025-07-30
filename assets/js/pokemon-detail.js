let listItems = null;
let selectedPokemon = null;

const pokemonDetails = {}
const pokeballBackground = document.createElement('img');
const mainContent = document.getElementById('main-content')
const section = document.createElement('section');

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
        })
    })
}

pokemonDetails.closeDetailsScreen = (pageChange = false) => {
    const pokemonList = document.getElementById('pokemonList')
    if (pokemonList.classList.contains('details-open-pokemon')){
        pokemonList.classList.remove('details-open-pokemon')
    }

    mainContent.className = "content";

    const screen = document.getElementById('detailScreen')
    if (screen != undefined)
        screen.remove()

    if (pageChange == true)
        selectedPokemon = null;
}

function verifyDetailsScreen(id) {
    //Isso não funciona, pois appendChild só aceita elementos DOM, e não html puro
    // const section = `<section class="content"></section>`    

    if (selectedPokemon != null)
        pokemonDetails.closeDetailsScreen()
    
    if (selectedPokemon != id)
        preparePokemonScreen(id)
    else
        selectedPokemon = null;

}

function preparePokemonScreen(id){

    const pokemonList = document.getElementById('pokemonList')
    if (!pokemonList.classList.contains('details-open-pokemon'))
        pokemonList.className += " details-open-pokemon"

    selectedPokemon = id;
    document.getElementById('main').appendChild(section)
    mainContent.className = "content details-open-main";

    getDetailHtml(id)
}

async function getDetailHtml(id){

    const pokemon = pokeApi.getPokemons(offset + id, 1)
        .then((pokemons) => pokemons[0])
    
    const html =  fetch('detail.html')
        .then(response => response.text())

    await Promise.all([pokemon, html])
        .then(([pokemon, html]) => buildDetailHtml(pokemon, html))

    //outra forma de fazer, menos legível
    /* pokeApi.getPokemons(offset + id, 1)
        .then((pokemons) => pokemons[0])
        .then((pokemon) => {
            fetch('detail.html')
                .then(response => response.text())
                .then(html => buildDetail(pokemon, html))
        }) 
    */
}

function buildDetailHtml(pokemon, html) {
    // Card
    const detailScreen = document.getElementById('detailScreen');
    detailScreen.innerHTML = html;
    detailScreen.className = `content details-content ${pokemon.type}-background`;

    // Imagem de pokebola
    const pokeballCard = document.getElementById('pokeball-card');
    pokeballCard.appendChild(pokeballBackground);
    
    // Imagem do Pokémon
    const pokemonImage = document.createElement('img')
    pokemonImage.src = pokemon.photo;
    pokemonImage.className = 'pokemon-image';

    // Adiciona a imagem do Pokémon ao card
    const imageCard = document.getElementById('image-card');
    imageCard.appendChild(pokemonImage)

    // Titulo
    const pokemonTitle = document.getElementById('pokemon-title');
    pokemonTitle.innerHTML = pokemon.name;

    buildStatsHtml(pokemon)
    buildAbilitiesHtml(pokemon)
    if (pokemon.variations != null)
        buildVariationsHtml(pokemon)
}

function buildStatsHtml(pokemon){
    const statCard = document.getElementById('stat-card');
    pokemon.stats.map((stat) => {
        let width = stat.value * 100 / 255; 

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
}

function buildAbilitiesHtml(pokemon) {
    const abilitiesCard = document.getElementById('abilities-list');
    pokemon.abilities.map((ability) => {
        hidden = '';
        if (ability.isHidden)
            hidden = `<div class='hidden'>hidden</div>`
        abilitiesCard.innerHTML += `
            <li class='ability'>
                <div class='ability-name'>${ability.name}</div>${hidden}
            </li>
        `
    })
}

function buildVariationsHtml(pokemon){
    const bottom = document.getElementById('bottom');
    bottom.innerHTML += `
            <div class="card">
                <h3 class="card-title">Forms</h3>
                <div class="variations-list" id="variations-list"></div>
            </div>
        `
    const variationsList = document.getElementById('variations-list');
    setTimeout(() => {
        console.log(pokemon.variations)
        pokemon.variations.shift()
        pokemon.variations.forEach((pokemonVariation) => {
        variationsList.innerHTML += `
            <div class='variation'>
                <img src='${pokemonVariation.photo}' ref='${pokemonVariation.photo}'>             
                <p class='variation-name'>${pokemonVariation.name}</p>
            </div>
        `
        })
    }, 10);
    
}
