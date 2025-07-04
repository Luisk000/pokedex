let listItems = null;
let selectedPokemon = null;

const pokemonDetails = {}
const pokeballBackground = document.createElement('img');
const mainContent = document.getElementById('main-content')
const section = document.createElement('section');

pokeballBackground.src = "images/pokeball.png"

section.className = 'content details-content';
section.id = 'detailScreen';

pokemonDetails.loadPokemonDetails = () => {
    listItems = document.getElementById('pokemonList').querySelectorAll(':scope > li');
    selectedPokemon = null;

    listItems.forEach((item, index) => {
        item.id = 'pokemon' + index;
        item.addEventListener('click', () => {
            verifyDetailsScreen(index)
        })
    })
}

function verifyDetailsScreen(id) {
    //Isso não funciona, pois appendChild só aceita elementos DOM, e não html puro
    // const section = `<section class="content"></section>`    

    if (selectedPokemon != null)
        pokemonDetails.closeDetailsScreen()
    
    if (selectedPokemon != id)
        openDetailsScreen(id)
    else
        selectedPokemon = null;

}

function openDetailsScreen(id){
    const pokemonList = document.getElementById('pokemonList')
    if (!pokemonList.classList.contains('details-open-pokemon')){
        pokemonList.className += " details-open-pokemon"
    }

    selectedPokemon = id;
    document.getElementById('main').appendChild(section)
    getSinglePokemon(id)
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

function getSinglePokemon(id){
    pokeApi.getPokemons(offset + id, 1)
    .then((pokemon) => {      
        openDetailHtml(pokemon[0]);
    })
}

function openDetailHtml(pokemon){
    fetch('detail.html')
        .then(response => response.text())
        .then(html => {
            const detailScreen = document.getElementById('detailScreen');

            detailScreen.innerHTML = html;
            detailScreen.className = `content details-content ${pokemon.type}-background`;

            const pokeballCard = document.getElementById('pokeball-card');
            pokeballCard.appendChild(pokeballBackground);
            
            mainContent.className = "content details-open-main";
            
            const pokemonImage = document.createElement('img')
            pokemonImage.src = pokemon.photo;
            pokemonImage.className = 'pokemon-image';

            const imageCard = document.getElementById('image-card');
            imageCard.appendChild(pokemonImage)

            const pokemonTitle = document.getElementById('pokemon-title');
            pokemonTitle.innerHTML = pokemon.name;
        })
}

function converterPokemonStatsHtml(pokemonStats) {
    return pokemonStats.map((stat) => {
        return `<li class="stat"></li>`
    })
}
