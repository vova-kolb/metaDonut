document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('a[href^="#recipe"]').addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const offset = 0; // например, высота фиксированного хедера

        window.scrollTo({
            top: target.offsetTop - offset,
            behavior: 'smooth'
        });
    });
})


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    fetchData().then(itemsRender).then(handleCat)
    fetchRecipe(id).then(singleItemRender)
    fetchReviews().then(reviewsRender).then(initSlider)
    initReviewForm()
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
                        <a href="./donut.html?id=${item.id}" class="btn">How to do it</a>
                    </div>
                </div>
        `
    })
    container.innerHTML = items.reduce((item, acc) => acc += item, '')
}

const singleItemRender = function (recipe) {
    const singleRecipe = document.querySelector('.donut_recipe')

    console.log(recipe)

    const preparation = recipe.content.preparation.reverse().map((item) => `<li>${item}</li>`).reduce((item, acc) => acc += item, '')
    const tips = recipe.content.tips.map(item => `<li>${item}</li>`).reduce((item, acc) => acc += item, '')
    const ingredients = recipe.ingredients.map(item => `<li>${item}</li>`).reduce((item, acc) => acc += item, '')

    singleRecipe.innerHTML = `
        <div class="donut_hero"><img src="./images/donuts/${recipe.id}.jpg"></div>
        <div class="container">
            <h2 class="donut_name">${recipe.name}</h2>
            <div class="donut_desc">${recipe.content.overview}</div>
<!--            <div class="donut_category">${recipe.category}</div>-->
            <div class="donut_wrap">
                <div class="donut_img"><img src="./images/donuts/${recipe.id}.jpg"></div>
                <div class="donut_ingredients">
                    <h3>Ingredients:</h3>
                    <ul>
                    ${ingredients}
                    </ul>
                </div>
            </div>
             <div class="donut_wrap">
                 <div class="recipe_preparation">
                        <h3>How to cook it:</h3>
                        <ol>
                            ${preparation}
                        </ol>
                 </div>
                <div class="donut_tips">
                        <h3>Cooking tips:</h3>
                        <ul>
                            ${tips}
                        </ul>
                </div>
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

/**************************REVIEWS*****************************/

const fetchReviews = async function () {
    try {
        const result = await fetch('http://localhost:3000/reviews')
        return result.json()
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return []
    }
}

const reviewsRender = function (reviews) {
    const sliderTrack = document.querySelector('.reviews_slider_track')
    
    if (!sliderTrack || reviews.length === 0) return reviews

    const reviewCards = reviews.map(review => {
        const recipeHTML = review.recipe ? `<div class="review_recipe">Recipe: ${review.recipe}</div>` : ''
        const initials = getInitials(review.name)
        const stars = renderStars(review.rating || 5)
        
        return `
            <div class="review_card">
                <div class="review_header">
                    <div class="review_avatar">${initials}</div>
                    <div class="review_author">
                        <div class="review_name">${review.name}</div>
                        ${recipeHTML}
                        <div class="review_rating">${stars}</div>
                    </div>
                    <div class="review_date">${formatDate(review.date)}</div>
                </div>
                <div class="review_text">"${review.text}"</div>
            </div>
        `
    })
    
    sliderTrack.innerHTML = reviewCards.reduce((acc, card) => acc += card, '')
    return reviews
}

const getInitials = function (name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

const renderStars = function (rating) {
    let stars = ''
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star">★</span>'
        } else {
            stars += '<span class="star empty">★</span>'
        }
    }
    return stars
}

const formatDate = function (dateString) {
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
}

let currentSlide = 0
let totalSlides = 0

const initSlider = function (reviews) {
    if (!reviews || reviews.length === 0) return

    totalSlides = reviews.length
    const sliderTrack = document.querySelector('.reviews_slider_track')
    const prevBtn = document.getElementById('prevReview')
    const nextBtn = document.getElementById('nextReview')
    const dotsContainer = document.querySelector('.slider_dots')

    if (!sliderTrack || !prevBtn || !nextBtn) return

    // Create dots
    if (dotsContainer) {
        const dots = Array(totalSlides).fill(0).map((_, index) => {
            return `<span class="dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>`
        }).join('')
        dotsContainer.innerHTML = dots

        // Add click handlers to dots
        dotsContainer.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentSlide = parseInt(dot.dataset.slide)
                updateSlider()
            })
        })
    }

    const updateSlider = () => {
        sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`
        prevBtn.disabled = currentSlide === 0
        nextBtn.disabled = currentSlide === totalSlides - 1
        
        // Update dots
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide)
            })
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--
            updateSlider()
        }
    })

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++
            updateSlider()
        }
    })

    updateSlider()

    // Auto-play slider
    setInterval(() => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++
        } else {
            currentSlide = 0
        }
        updateSlider()
    }, 5000) // Change slide every 5 seconds
}

const initReviewForm = function () {
    const form = document.getElementById('reviewForm')
    const formMessage = document.getElementById('formMessage')

    if (!form || !formMessage) return

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const formData = {
            name: document.getElementById('reviewName').value.trim(),
            recipe: document.getElementById('reviewRecipe').value.trim(),
            text: document.getElementById('reviewText').value.trim(),
            date: new Date().toISOString().split('T')[0]
        }

        if (!formData.name || !formData.text) {
            showMessage('Please fill in all required fields!', 'error')
            return
        }

        try {
            const response = await fetch('http://localhost:3000/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                showMessage('Thank you for your review! It has been successfully submitted.', 'success')
                form.reset()
                
                // Reload reviews
                setTimeout(() => {
                    currentSlide = 0
                    fetchReviews().then(reviewsRender).then(initSlider)
                    formMessage.className = 'form_message'
                }, 3000)
            } else {
                showMessage('An error occurred while submitting your review. Please try again later.', 'error')
            }
        } catch (error) {
            console.error('Error submitting review:', error)
            showMessage('An error occurred while submitting your review. Please try again later.', 'error')
        }
    })
}

const showMessage = function (text, type) {
    const formMessage = document.getElementById('formMessage')
    formMessage.textContent = text
    formMessage.className = `form_message ${type}`
    
    setTimeout(() => {
        formMessage.className = 'form_message'
    }, 5000)
}