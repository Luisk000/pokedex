const evolution = {}
const evolutionChains = []

let listEvolutionItems = null;

evolution.getEvolutions = async (pokemon, dados) => {
    await fetch(dados.evolution_chain.url)
        .then((result) => result.json())
        .then((evolutionChain) => getEvolutionChain(pokemon, evolutionChain.chain))
}

evolution.buildEvolutionsHtml = async (pokemon) => {
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
                getDetailHtmlByNumber(number)
                window.scrollTo(0, 0);
            })
        }
    })
}

async function getEvolutionChain(pokemon, chain){
    const evolutionChain = {
        number: undefined,
        pokemons: []
    }

    await verifyEvolutionChain(evolutionChain, chain, i = 0);
    pokemon.evolutionChain = evolutionChain;
}

async function verifyEvolutionChain(evolutionChain, chain, i){
    await fetch(chain.species.url.replace("-species", ""))
        .then((result) => result.json())
        .then((pokemonDados) => {
            if (i == 0 && evolutionChains.find(e => e.number == pokemonDados.id)) 
                getExistingEvolutionChain(evolutionChain, pokemonDados)
            else 
                getNewEvolutionChain(evolutionChain, pokemonDados, chain, i)                      
        })
}

async function getExistingEvolutionChain(evolutionChain, pokemonDados){
    let existingEvolutionChain = evolutionChains.find(e => e.number == pokemonDados.id)
    evolutionChain.number = existingEvolutionChain.number;
    evolutionChain.pokemons = existingEvolutionChain.pokemons;
}

async function getNewEvolutionChain(evolutionChain, pokemonDados, chain, i){
    if (i == 0){
        evolutionChain.number = pokemonDados.id;    
        i++;
    }

    let pokemon = new Pokemon();
    pokeApi.buildPokemon(pokemon, pokemonDados);

    evolutionChain.pokemons.push(pokemon)  
    evolutionChains.push(evolutionChain)

    buildEvolutionChainEvolutions(evolutionChain, pokemon, chain, i);
}

async function buildEvolutionChainEvolutions(evolutionChain, pokemon, chain, i){
    if (chain.evolves_to.length > 0){
        chain.evolves_to.forEach(async (pokemonChain) => {
            pokemon.evolvesTo.push(pokemonChain.species.name)
            verifyEvolutionChain(evolutionChain, pokemonChain, i);
        })
    }
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
        nextEvolutions = nextEvolutions.flat(1)
        buildNextEvolutionsHtml(allPokemon, nextEvolutions, i)
    }
}
