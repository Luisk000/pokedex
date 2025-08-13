const gender = {}
let pokemonsMasculinos = []
let pokemonsFemininos = []
let pokemonsSemGenero = []
let gotGenders = false;

gender.getGenders = async () => {
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

gender.getPokemonGenders = (pokemon) => {
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