let offset = 0;
let pokemonLoaded = false;
const pokemonList = document.getElementById('pokemonList')
const firstPageButton = document.getElementById('firstPageButton')
const previousPageButton = document.getElementById('previousPageButton')
const nextPageButton = document.getElementById('nextPageButton')
const lastPageButton = document.getElementById('lastPageButton')

function getPokemon(){
    pokeApi.getPokemons(offset).then((pokemons = []) => {       
        let innerHTML = '';
        innerHTML += pokemons.map((pokemon) => converterPokemonHtml(pokemon)).join("")
        pokemonList.innerHTML = '';
        pokemonList.innerHTML = innerHTML;
        addPokemonDetailsScripts();
    })
}

function converterPokemonTypesHtml(pokemonTypes) {
    return pokemonTypes.map((type) => {
        return `<li class="type ${type}">${type}</li>`
    })
}

function converterPokemonHtml(pokemon) {
    return `<li class="pokemon ${pokemon.type}" id="pokemon${pokemon.number}">
                <span class="number">#${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>         
                <div class="detail">
                    <img src="${pokemon.photo}" alt="${pokemon.name}">
                    <ol class="types">
                        ${converterPokemonTypesHtml(pokemon.types).join('')}
                    </ol>
                </div>
            </li>
            `
}

function addPokemonDetailsScripts(){
    pokemonDetails.openDetailsScreen()
}


firstPageButton.addEventListener('click', () => {
    offset = 0;   
    getPokemon();
    pokemonDetails.closeDetailsScreen();
})

previousPageButton.addEventListener('click', () => {
    offset -= 20;
    if (offset < 0)
        offset = 0
    getPokemon();
    pokemonDetails.closeDetailsScreen();
})

nextPageButton.addEventListener('click', () => {
    offset +=20;
    if (offset > 1005)
        offset = 1005
    getPokemon();
    pokemonDetails.closeDetailsScreen();
})

lastPageButton.addEventListener('click', () => {
    offset = 1005;
    getPokemon();
    pokemonDetails.closeDetailsScreen(); 
})

getPokemon();