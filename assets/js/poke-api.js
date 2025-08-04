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
            const variacoes = 
                dados.varieties.length == 1 ? "" :
                getVariacoes(pokemon, dados)

            const evolucoes = getEvolucoes(pokemon, dados)

            await Promise.all([variacoes, evolucoes])
        })
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

    //#region 
        //A mesma coisa com then
        /* await Promise.all(variacoesPromise).then((variacoesFormatadas) => {
            if (variacoesFormatadas != null){
                pokemon.variations = variacoesFormatadas;   
                pokemon.variations.map((variacao) => variacao.variations = variacoes)
            }
        }); */
        //#endregion      

    pokemon.variations = await Promise.all(variacoesPromise);
    pokemon.variations.map((variacao) => variacao.variations = variacao)
}


async function getEvolucoes(pokemon, dados){
    if (pokemon.number <= 3){
        const evolutionChain = fetch(dados.evolution_chain.url)
            .then((result) => result.json())
            .then((evolutionChain) => buildEvolutionChain(pokemon, evolutionChain.chain))
    }
}

async function buildEvolutionChain(pokemon, chain){
    let pokemons = [];

    verifyEvolvesTo(pokemons, chain);
}

async function verifyEvolvesTo(pokemons, chain){
    fetch(chain.species.url)
        .then((result) => result.json())
        .then((pokemonDados) => {
            let pokemon = new Pokemon();
            console.log(pokemonDados)
            //buildPokemon(pokemon, pokemonDados);
            pokemons.push(pokemon)
        })

    if (chain.evolves_to.length > 0){
        chain.evolves_to.forEach((pokemonChain) => {
            verifyEvolvesTo(pokemons, pokemonChain)
        })
    }
}
    