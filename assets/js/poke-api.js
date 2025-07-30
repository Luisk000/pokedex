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
    return buildPokemonVariations(pokemon, pokeDetail)
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

async function buildPokemonVariations(pokemon, pokeDetail){
    await converterVariacoes(pokeDetail)
        .then((result) => Promise.all(result))
        .then((variacoes) => {
            pokemon.variations = variacoes;   
            if (pokemon.variations != null){
                pokemon.variations.map((variacao) => {
                    variacao.variations = variacoes;
                })
            }
        })
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

async function converterVariacoes(pokeDetail){
    return fetch(pokeDetail.species.url)
        .then((response) => response.json())
        .then((dados) => {
            if (dados.varieties && dados.varieties.length > 1)
                return converterVariacoesParaPokemons(dados.varieties)
            else
                return [];
        })
    
}

async function converterVariacoesParaPokemons(variacoes){
    const result = variacoes.map((variacao) => 
        fetch(variacao.pokemon.url)
            .then((response) => response.json())
            .then((pokemonVariacao) => {
                let pokemon = new Pokemon();
                buildPokemon(pokemon, pokemonVariacao);
                return pokemon;
            })
        )

    await Promise.all(result);
    return result;
}
    