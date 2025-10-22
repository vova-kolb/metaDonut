// document.querySelector('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         const target = document.querySelector(this.getAttribute('href'));
//         const offset = 0; // например, высота фиксированного хедера

//         window.scrollTo({
//             top: target.offsetTop - offset,
//             behavior: 'smooth'
//         });
//     });
// });

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    fetchData().then(itemsRender).then(handleCat)
    fetchRecipe(id).then(singleItemRender)
})

const container = document.querySelector('.recipes_list')

const fetchData = async function () {
    const result = await fetch('http://localhost:3000/donuts')
    return result.json()
}

const fetchRecipe = async function (id) {
    const result = await fetch(`http://localhost:3000/donuts/${id}`)
    return result.json()
}

const itemsRender = function (data) {
    const items = data.map(item => {
        return `
                 <div class="recipe_item" data-cat="${item.category}">
                    <div class="item_img"><img src="./images/donuts/${item.id}.jpg"></div>
                    <div class="item_wrap">
                        <div class="item_name">${item.name}</div>
                        <div class="item_description">${item.description}</div>
                        <a href="./page.html?id=${item.id}" class="btn">How to do it</a>
                    </div>
                </div>
        `
    })
    container.innerHTML = items.reduce((item, acc) => acc += item, '')
}

const singleItemRender = function (recipe) {
    const singleRecipe = document.querySelector('.donut_recipe')

    console.log(recipe)

    const preparation = recipe.content.preparation.map((item) => `<li>${item}</li>`).reduce((item, acc) => acc += item, '')
    const tips = recipe.content.tips.map(item => `<li>${item}</li>`).reduce((item, acc) => acc += item, '')
    const ingredients = recipe.ingredients.map(item => `<li>${item}</li>`).reduce((item, acc) => acc += item, '')

    singleRecipe.innerHTML = `
        <h2 class="donut_name">${recipe.name}</h2>
        <div class="donut_desc">${recipe.content.overview}</div>
        <div class="donut_category">${recipe.category}</div>
        <div class="donut_wrap">
            <div class="donut_img"><img src="./images/donuts/${recipe.id}.jpg"></div>
            <div class="donut_ingredients">
                <ul>
                ${ingredients}
                </ul>
            </div>
        </div>
        <div class="donut_wrap">
            <div class="recipe_preparation">
                <h3>How to cook it:</h3>
                <or>
                    ${preparation}
                </or>
            </div>
            <div class="donut_tips">
                <ul>
                    ${tips}
                </ul>
            </div>
        </div>`
}

const handleCat = async function (data) {
    const navItems = document.querySelectorAll('.recipes_nav > button');
    const recipeItems = document.querySelectorAll('.recipe_item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const selectedCat = item.dataset.cat;

            recipeItems.forEach(recipe => {
                const recipeCat = recipe.dataset.cat;
                if (selectedCat === 'all' || recipeCat === selectedCat) {
                    recipe.style.display = 'block';
                } else {
                    recipe.style.display = 'none';
                }
            });
        });
    });

    navItems[0].click();
}