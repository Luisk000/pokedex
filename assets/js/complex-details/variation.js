const variation = {}

let listVariationItems = null;

variation.getVariacoes = async (pokemon, dados) => { 
    const variacoesPromise = dados.varieties.map((variacao) => 
        fetch(variacao.pokemon.url)
            .then((response) => response.json())
            .then((pokemonDados) => {
                let pokemon = new Pokemon();
                pokeApi.buildPokemon(pokemon, pokemonDados);
                return pokemon;
            })
    )

    pokemon.variations = await Promise.all(variacoesPromise);
    pokemon.variations.map((variacao) => variacao.variations = variacao)
}

variation.buildVariationsHtml = (pokemon) => {
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
            getDetailHtmlByNumber(number)
            window.scrollTo(0, 0);
        })
    })
}

async function getDetailHtmlByNumber(number){
    const url = `https://pokeapi.co/api/v2/pokemon/${number}/`

    const pokemon = pokeApi.getPokemonDetail(url)
        .then((pokemonDetail) => pokemonDetail)

    pokemonDetails.getDetailHtml(pokemon)
}