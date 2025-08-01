const pokeApi = {}

pokeApi.getPokemonDetail = (url) => {
    return fetch(url)
        .then((response) => response.json())
        .then((pokeDetail) => convertPokeApiDetailToPokemon(pokeDetail))
}

pokeApi.getPokemons = (offset = 0, limit = 20) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    return fetch(url)
        .then((response) => response.json()) // isso é um retorno, e após isso, a segeunda linha é executada
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
    pokemon.types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    pokemon.type = pokemon.types[0];
    pokemon.stats = converterStats(pokeDetail);
    pokemon.abilities = converterAbilities(pokeDetail);
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
            const variacoes = converterVaricoes(pokemon, dados)
            const evolucoes = converterEvolucoes()

            await Promise.all([variacoes, evolucoes])
        })
    
}

async function converterVaricoes(pokemon, dados){ 
    if (dados.varieties && dados.varieties.length > 1)
        return converterVariacoesParaPokemons(pokemon, dados.varieties)
    else
        return "";
}

async function converterEvolucoes(){
    return "";
}

async function converterVariacoesParaPokemons(pokemon, variacoes){
    const variacoesFormatadas = variacoes.map((variacao) => 
        fetch(variacao.pokemon.url)
            .then((response) => response.json())
            .then((pokemonVariacao) => {
                let pokemon = new Pokemon();
                buildPokemon(pokemon, pokemonVariacao);
                return pokemon;
            })
        )

    //Acho que há um problema aqui
    await Promise.all(variacoesFormatadas);
    pokemon.variations = variacoesFormatadas;   
        console.log(pokemon.variations)
    if (pokemon.variations != null)
        pokemon.variations.map((variacao) => variacao.variations = variacoes)
    
    return "";
}
    