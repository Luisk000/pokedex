const pokeApi = {}

function converPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name.replace("-"," ");
    pokemon.photo = pokeDetail.sprites.other["official-artwork"].front_default
    pokemon.types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    pokemon.type = pokemon.types[0];
    return pokemon;
}

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
    