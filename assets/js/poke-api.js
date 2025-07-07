const pokeApi = {}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then((pokeDetail) => converPokeApiDetailToPokemon(pokeDetail))
}

pokeApi.getPokemons = (offset = 0, limit = 20) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    return fetch(url)
        .then((response) => response.json()) // isso é um retorno, e após isso, a segeunda linha é executada
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonDetails) => pokemonDetails)
        .catch((error) => console.log(error))
}

function converPokeApiDetailToPokemon(pokeDetail) {
/*     if (pokeDetail.id == 3){
        console.log(pokeDetail)
        fetch(pokeDetail.species.url)
            .then((response) => response.json())
            .then((forms) => { console.log(forms) })
    } */

    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name.replace("-"," ");
    pokemon.photo = pokeDetail.sprites.other["official-artwork"].front_default
    pokemon.types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    pokemon.type = pokemon.types[0];
    pokemon.stats = converterStats(pokeDetail);
    pokemon.abilities = converterAbilities(pokeDetail);
    getDadosComplexos(pokemon, pokeDetail)
    return pokemon;
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

function getDadosComplexos(pokemon, pokeDetail){
    pokemon.variations = converterVariacoes(pokeDetail);
    console.log(pokemon.variations)
}

function converterVariacoes(pokeDetail){
    //Promise.all espera o que está dentro
    const variations = fetch(pokeDetail.species.url)
        .then((response) => response.json())
        .then((dados) => Promise.all(dados.varieties.map((variacao) => 
            fetch(variacao.pokemon.url)
                .then((response) => response.json())
                .then((variacao) => {                   
                    return variacao
                })
        )))
    
    variations.then((result) => result)
}
    