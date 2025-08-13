const pokeApi = {}

pokeApi.getPokemons = async (offset = 0, limit = 20) => {
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

pokeApi.getPokemonDetail = (url) => {
    return fetch(url)
        .then((response) => response.json())
        .then((pokeDetail) => convertPokeApiDetailToPokemon(pokeDetail))
}

pokeApi.buildPokemon = (pokemon, pokeDetail) => {
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

async function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokeApi.buildPokemon(pokemon, pokeDetail)
    await buildDadosComplexos(pokemon, pokeDetail);
    return pokemon
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

async function buildDadosComplexos(pokemon, pokeDetail){
    return fetch(pokeDetail.species.url)
        .then((response) => response.json())
        .then(async (dados) => {
            buildCategory(pokemon, dados)
            buildEntry(pokemon, dados)
            gender.getPokemonGenders(pokemon)

            const variacoes = 
                dados.varieties.length == 1 ? "" :
                await variation.getVariacoes(pokemon, dados)

            const evolucoes = await evolution.getEvolutions(pokemon, dados)

            await Promise.all([variacoes, evolucoes])
        })
}

function buildCategory(pokemon, dados){
    pokemon.category = dados.genera.find(p => p.language.name == "en").genus
}

function buildEntry(pokemon, dados){
    const englishEntries = dados.flavor_text_entries.filter(t => t.language.name == 'en');
    const lastEntry = englishEntries[englishEntries.length - 1];
    pokemon.entry = lastEntry.flavor_text;
    pokemon.activeGameVersion = lastEntry.version.name;
    pokemon.gameVersions = englishEntries
}
