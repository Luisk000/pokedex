const pokeApi = {}
const evolutionChains = []
let pokemonsMasculinos = []
let pokemonsFemininos = []
let pokemonsSemGenero = []
let gotGenders = false;

pokeApi.getPokemonDetail = (url) => {
    return fetch(url)
        .then((response) => response.json())
        .then((pokeDetail) => convertPokeApiDetailToPokemon(pokeDetail))
}

pokeApi.getPokemons = async (offset = 0, limit = 20) => {
    await getGenders();
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(
            (pokemon) => pokeApi.getPokemonDetail(pokemon.url))
        )
        .then((detailRequests) => Promise.all(detailRequests))
        .catch((error) => console.log(error))
}

async function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    buildPokemon(pokemon, pokeDetail)
    await buildDadosComplexos(pokemon, pokeDetail);
    return pokemon
}

function buildPokemon(pokemon, pokeDetail){
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name.replace("-"," ");
    pokemon.photo = pokeDetail.sprites.other["official-artwork"].front_default
    pokemon.shiny = pokeDetail.sprites.other["official-artwork"].front_shiny
    pokemon.activeImage = pokemon.photo;
    pokemon.types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    pokemon.type = pokemon.types[0];
    pokemon.stats = converterStats(pokeDetail);
    pokemon.abilities = converterAbilities(pokeDetail);
    pokemon.height = converterNumero(pokeDetail.height, pokemon) + "m";
    pokemon.weight = converterNumero(pokeDetail.weight, pokemon) + "kg";
}

function converterNumero(number, pokemon) {
    number = number.toString()
    if (pokemon.number == 3){
    }
    if (number.length == 1)
        return "0." + number
    else
    {
        let lastChar = number.substr(number.length - 1);
        number = number.slice(0, -1);
        return number + "." + lastChar;
    }
}

function converterStats(pokeDetail){
    const stats = pokeDetail.stats.map((stat) => {
        const statModel = new Stat();
        statModel.name = stat.stat.name.replace("special-","Sp. ").replace("hp","HP");
        statModel.value = stat.base_stat;
        return statModel;
    });
    return stats;
}

function converterAbilities(pokeDetail) {
    const abilities = pokeDetail.abilities.map((ability) => {
        const abilityModel = new Ability();
        abilityModel.name = ability.ability.name.replace("-"," ");
        abilityModel.isHidden = ability.is_hidden;
        return abilityModel;
    })
    return abilities;
}

async function buildDadosComplexos(pokemon, pokeDetail){
    return fetch(pokeDetail.species.url)
        .then((response) => response.json())
        .then(async (dados) => {
            buildEntry(pokemon, dados)

            pokemon.category = dados.genera.find(p => p.language.name == "en").genus

            const genders = getPokemonGenders(pokemon)

            const variacoes = 
                dados.varieties.length == 1 ? "" :
                getVariacoes(pokemon, dados)

            const evolucoes = getEvolucoes(pokemon, dados)

            await Promise.all([genders, variacoes, evolucoes])
        })
}

function buildEntry(pokemon, dados){
    const englishEntries = dados.flavor_text_entries.filter(t => t.language.name == 'en');
    const lastEntry = englishEntries[englishEntries.length - 1];
    pokemon.entry = lastEntry.flavor_text;
    pokemon.activeGameVersion = lastEntry.version.name;
    pokemon.gameVersions = englishEntries
}

async function getVariacoes(pokemon, dados){ 
    const variacoesPromise = dados.varieties.map((variacao) => 
        fetch(variacao.pokemon.url)
            .then((response) => response.json())
            .then((pokemonDados) => {
                let pokemon = new Pokemon();
                buildPokemon(pokemon, pokemonDados);
                return pokemon;
            })
    )

    pokemon.variations = await Promise.all(variacoesPromise);
    pokemon.variations.map((variacao) => variacao.variations = variacao)
}


async function getEvolucoes(pokemon, dados){
    await fetch(dados.evolution_chain.url)
        .then((result) => result.json())
        .then((evolutionChain) => getEvolutionChain(pokemon, evolutionChain.chain))
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
    buildPokemon(pokemon, pokemonDados);

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

async function getGenders(){
    const pokemonsFemininosPromise = fetch('https://pokeapi.co/api/v2/gender/1')
        .then((result) => result.json())
        .then((pokemons) => pokemonsFemininos = pokemons)

    const pokemonsMasculinosPromise = fetch('https://pokeapi.co/api/v2/gender/2')
        .then((result) => result.json())
        .then((pokemons) => pokemonsMasculinos = pokemons)
    
    const pokemonsSemGeneroPromise = fetch('https://pokeapi.co/api/v2/gender/3')
        .then((result) => result.json())
        .then((pokemons) => pokemonsSemGenero = pokemons)

    await Promise.all([pokemonsFemininosPromise, pokemonsMasculinosPromise, pokemonsSemGeneroPromise])
}

async function getPokemonGenders(pokemon){
    let pokemonFeminino = pokemonsFemininos.pokemon_species_details
        .find(p => p.pokemon_species.name == pokemon.name)

    let pokemonMasculino = pokemonsMasculinos.pokemon_species_details
        .find(p => p.pokemon_species.name == pokemon.name)

    let pokemonSemGenero = pokemonsSemGenero.pokemon_species_details
        .find(p => p.pokemon_species.name == pokemon.name)

    let genders = []

    if (pokemonMasculino)
        genders.push("&male;")

    if (pokemonFeminino)
        genders.push("&female;")

    if (pokemonSemGenero)
        genders.push("Genderless")

    pokemon.genders = genders.join(" / ");
}