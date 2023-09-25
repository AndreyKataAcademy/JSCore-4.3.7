/*
звёзды - watchers,
Владелец - owner => login;
Имя - name
html_url
*/
'use strict'
const input = document.querySelector("input");
const resultDiv = document.querySelector(".search");
const body = document.querySelector('body');
const section = document.querySelector('section');
const flexCenter = 'display: flex; align-items: center; justify-content: space-evenly;';
const gridFavorite = 'display: grid; grid-template-columns: 300px 100px 100px 50px'
let favoriteRepositoriesArray = [];
let request;

const removeFavoriteRepository = id => {
    favoriteRepositoriesArray = favoriteRepositoriesArray.filter(element => element.id !== Number(id));
    document.querySelector('.favorite-repositories').removeChild(document.querySelector(`[data-favoriterepo="${id}"]`));
    if(!favoriteRepositoriesArray.length) section.removeChild(document.querySelector('.favorite-repositories'));
}

const favoriteRepository = (repo) => {
    return `
        <div data-favoriterepo="${repo.id}" style="${gridFavorite}" class="favorite-repository">
            <p style="overflow: hidden; padding: 5px">${repo.name}</p>
            <p style="overflow: hidden; padding: 5px">${repo.owner}</p>
            <p style="overflow: hidden; padding: 5px">${repo.stars}</p>
            <button data-removeid="${repo.id}" class="remove-repo">Delete</button>
        </div>
    `
}
const favoriteRepositories = () => {
    return `
    <div class="favorite-repositories" style="background-color: #fff; display: flex; flex-direction: column; gap: 4px">
    <div style="${gridFavorite}">
            <p style="overflow: hidden; padding: 5px">Name:</p>
            <p style="overflow: hidden; padding: 5px">Owner:</p>
            <p style="overflow: hidden; padding: 5px">Stars:</p>
        </div>
    </div>
    `;
}
const addFavoriteRepositories = (repo) => {
    if (!favoriteRepositoriesArray.length) section.insertAdjacentHTML('afterbegin', favoriteRepositories())
    favoriteRepositoriesArray.push({
        id: Number(Date.now()),
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.watchers,
    });
    document.querySelector('.favorite-repositories').insertAdjacentHTML('beforeend', favoriteRepository(favoriteRepositoriesArray[favoriteRepositoriesArray.length - 1]));
    document.querySelectorAll('.remove-repo').forEach(element => {
        element.addEventListener('click', event => {
            removeFavoriteRepository(event.target.dataset.removeid);
        })
    })
}

const modalWindow = (errorMessage) => {
    return `
    <div class="error-modal" style="${flexCenter} z-index: 10;position: fixed; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.3); top:0; bottom:0">
        <div style="${flexCenter} padding: 20px; background-color: #fff; border-radius: 8px; display: flex; flex-direction: column; gap: 16px ">
        ${errorMessage}<br>
        <button class="close-error">Close</button>
        </div>
     </div>
    `;
}
const renderError = (error) => {
    body.insertAdjacentHTML('beforeend', modalWindow(error));
    document.querySelector('.close-error').addEventListener('click', (event) => {
        body.removeChild(document.querySelector('.error-modal'));
    });
}

const renderResults = (resultArray) => {
    const repos = document.querySelector('.repos');
    if (repos !== null) {
        resultDiv.removeChild(repos);
    }
    const renderRepos = (resultArray) => {
        let result = ``;
        for (let index = 0; index < 5; index++) {
            console.log(index);
            result += `<p style="position: relative"><a href="${resultArray[index].html_url}" target="_blank" data-key="${index}">${resultArray[index].name}</a><button class="add-repo" style="position: absolute; right: 0; z-index: 2;" data-id="${index}">Add</button></p>`;
        }
        console.log(repos);
        return result;
    }
    const html = `
        <div class="repos" style="margin-top: 10px; color: #9966FF;background-color: #fff; border-radius: 8px; padding: 10px 4px; display: flex; flex-direction: column; gap: 4px; width: 100%;">
            ${renderRepos(resultArray.items)}
        </div>`;
    resultDiv.insertAdjacentHTML('beforeend', html);
    document.querySelectorAll('.add-repo').forEach(element => {
        element.addEventListener('click', event => {
            addFavoriteRepositories(request.items[event.target.dataset.id]);
            input.value = '';
        })
    })
}

async function requestDataFromGitHub(searchName) {
    try {
        if (searchName.length === 0) return null;
        request = await fetch(`https://api.github.com/search/repositories?q=${searchName}`).then(response => response.json());
        console.log(request);
        if (request.items.length === 0) throw new Error('Repositories not found.')
        renderResults(request);
    } catch (error) {
        const repos = document.querySelector('.repos');
        if (repos !== null) {
            resultDiv.removeChild(repos);
        }
        input.blur();
        renderError(error);
    }
}

function debounce(func, delay = 1000) {
    let timer;

    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const delayedRequest = debounce(requestDataFromGitHub, 1000);

input.addEventListener('input', function (event) {
    delayedRequest(event.target.value);
});