let listItems = null;
let listVariationItems = null;
let listEvolutionItems = null;
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
            window.scrollTo(0, 0);
        })
    })
}

pokemonDetails.closeDetailsScreen = (pageChange = false) => {
    const pokemonList = document.getElementById('pokemonList')
    if (pokemonList.classList.contains('opened-pokemon-details'))
        pokemonList.classList.remove('opened-pokemon-details')

    mainContent.className = "content main-content";

    const screen = document.getElementById('detailScreen')
    if (screen != undefined)
        screen.remove()

    if (pageChange == true)
        selectedPokemon = null;
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
    const pokemonList = document.getElementById('pokemonList')
    if (!pokemonList.classList.contains('opened-pokemon-details'))
        pokemonList.className += " opened-pokemon-details"

    selectedPokemon = id;
    document.getElementById('main').appendChild(section)

    getDetailHtml(id)
}

async function getDetailHtml(id){
    const pokemon = pokeApi.getPokemons(offset + id, 1)
        .then((pokemons) => pokemons[0])
    
    const html =  fetch('detail.html')
        .then(response => response.text())

    await Promise.all([pokemon, html])
        .then(([pokemon, html]) => buildDetailHtml(pokemon, html))
}

async function getVariationDetailHtml(number){
    console.log(number)
    const url = `https://pokeapi.co/api/v2/pokemon/${number}/`

    const pokemon = pokeApi.getPokemonDetail(url)
        .then((pokemonDetail) => pokemonDetail)
    
    const html =  fetch('detail.html')
        .then(response => response.text())

    await Promise.all([pokemon, html])
        .then(([pokemon, html]) => buildDetailHtml(pokemon, html))
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

    buildInfoHtml(pokemon)
    buildStatsHtml(pokemon)
    buildAbilitiesHtml(pokemon)

    if (pokemon.evolutionChain.pokemons.length > 1)
        buildEvolutionsHtml(pokemon)
    if (pokemon.variations.length > 1)
        buildVariationsHtml(pokemon)
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

async function buildEvolutionsHtml(pokemon){
    const bottom = document.getElementById('bottom');
    bottom.innerHTML += `
            <div class="card">
                <h3 class="card-title">Evolution Chain</h3>
                <div class="evolutions-list" id="evolutions-list"></div>
            </div>
        `
    const firstEvolution = pokemon.evolutionChain.pokemons[0];
    await buildFirstEvolutionHtml(firstEvolution);
    await buildNextEvolutionsHtml(pokemon.evolutionChain.pokemons, firstEvolution.evolvesTo, 0)

    const evolutionsList = document.getElementById('evolutions-list')
    listEvolutionItems = evolutionsList.querySelectorAll(":scope > div > div > div")
    listEvolutionItems.forEach((item) => {
        const number = item.getAttribute('number');
        if (number != null){
            item.addEventListener('click', () => {
                getVariationDetailHtml(number)
                window.scrollTo(0, 0);
            })
        }

    })
}

async function buildFirstEvolutionHtml(firstEvolution){
    const evolutionsList = document.getElementById('evolutions-list')
    evolutionsList.innerHTML += `<div class='evolution-column' id='evolution-column'></div>`

    let evolutionColumn = document.getElementById(`evolution-column`)
    evolutionColumn.innerHTML += `
        <div class='evolution-line'>
            <div class='evolution' id='pokemon${firstEvolution.number}' number='${firstEvolution.number}'>         
                <div class="evolution-img-background">
                    <img src='${firstEvolution.photo}' ref='${firstEvolution.photo}'>
                </div>
                <p class='evolution-name'>${firstEvolution.name}</p>           
            </div>
        </div>
    `
}

async function buildNextEvolutionsHtml(allPokemon, evolutions, i){
    const evolutionsList = document.getElementById('evolutions-list')
    evolutionsList.innerHTML += `<div class='evolution-column' id='evolution-column-${i}'></div>`
    const evolutionColumn = document.getElementById(`evolution-column-${i}`)

    let pokemonEvolutions = [];
    evolutions.forEach((pokemonName) => {
        let pokemonEvolution = allPokemon.find(p => p.name == pokemonName)
        pokemonEvolutions.push(pokemonEvolution)
    })

    pokemonEvolutions.forEach((pokemonEvolution) => {
        if (pokemonEvolution == undefined)
            evolutionColumn.innerHTML += `<div class='evolution-line'></div>`
        else {
            evolutionColumn.innerHTML += `
                <div class='evolution-line'>
                    <div class="evolution-arrow">&#8594</div>
                    <div class='evolution' id='pokemon${pokemonEvolution.number}' number='${pokemonEvolution.number}'>         
                        <div class="evolution-img-background">
                            <img src='${pokemonEvolution.photo}' ref='${pokemonEvolution.photo}'>
                        </div>
                        <p class='evolution-name'>${pokemonEvolution.name}</p>           
                    </div>
                </div>
            `;
        }
        
    })

    let nextEvolutions = pokemonEvolutions.map((pokemonEvolution) => {
        if (pokemonEvolution != undefined)
            return pokemonEvolution.evolvesTo
        else 
            return undefined
    })

    let hasNextEvolutions = nextEvolutions.filter((evolutions) => evolutions != undefined && evolutions.length > 0).length > 0
    if (hasNextEvolutions){
        i++;
        buildNextEvolutionsHtml(allPokemon, nextEvolutions, i)
    }

    
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
    const variacaoAtual = pokemon.variations.findIndex(p => p.number == pokemon.number)

    pokemon.variations.splice(variacaoAtual, 1)
    pokemon.variations.forEach((pokemonVariation) => {
        variationsList.innerHTML += `
            <div class='variation' id='pokemon${pokemonVariation.number}' number='${pokemonVariation.number}'>
                <div class="variation-img-background">
                    <img src='${pokemonVariation.photo}' ref='${pokemonVariation.photo}'>
                </div>                     
                <p class='variation-name'>${pokemonVariation.name}</p>
            </div>
        `
    })

    listVariationItems = variationsList.querySelectorAll(":scope > div")
    listVariationItems.forEach((item) => {
        const number = item.getAttribute('number');
        item.addEventListener('click', () => {
            getVariationDetailHtml(number)
            window.scrollTo(0, 0);
        })
    })

    
    
}