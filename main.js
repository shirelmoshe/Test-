const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const imageContainer = document.getElementById('image-container');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModalButton = document.getElementById('close-modal');
const favoritesButton = document.getElementById('favorites-button');
const favoritesContainer = document.getElementById('favorites-container');
const tagCheckboxes = document.querySelectorAll('.filter-checkbox');
const loadMoreButton = document.createElement('button');

let favorites = [];
let currentTag = '';
let page = 1;

searchButton.addEventListener('click', performSearch);

tagCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const tag = checkbox.value;
    if (checkbox.checked) {
      currentTag = tag;
      performSearch();
    }
  });
});

loadMoreButton.innerText = 'Load More';
loadMoreButton.classList.add('load-more-button');
loadMoreButton.addEventListener('click', loadMoreImages);
imageContainer.after(loadMoreButton);

function performSearch() {
  const searchTerm = searchInput.value.trim();
  page = 1; // Reset page to 1 for new search

  fetch(`/api/images?searchTerm=${encodeURIComponent(searchTerm)}&currentTag=${encodeURIComponent(currentTag)}&page=${page}`)
    .then(response => response.json())
    .then(data => {
      const images = data.hits;
      displayImages(images);
    })
    .catch(error => {
      console.log('Error retrieving images:', error);
    });
}

function loadMoreImages() {
  page++;

  const searchTerm = searchInput.value.trim();

  fetch(`/api/images?searchTerm=${encodeURIComponent(searchTerm)}&currentTag=${encodeURIComponent(currentTag)}&page=${page}`)
    .then(response => response.json())
    .then(data => {
      const images = data.hits;
      displayImages(images);
    })
    .catch(error => {
      console.log('Error retrieving images:', error);
    });
}

function displayImages(images) {
  imageContainer.innerHTML = '';

  images.forEach(image => {
    const imageCard = createImageCard(image);

    // Check if the image is favorited
    const index = favorites.findIndex(favorite => favorite.id === image.id);
    if (index !== -1) {
      imageCard.classList.add('favorited');
    }

    imageContainer.appendChild(imageCard);
  });
}

function createImageCard(image) {
  const imageCard = document.createElement('div');
  imageCard.classList.add('image-card');

  const imageElement = document.createElement('img');
  imageElement.src = image.previewURL;
  imageElement.alt = image.tags;

  const favoriteButton = document.createElement('button');
  favoriteButton.classList.add('favorite-button');
  favoriteButton.innerHTML = '<i class="fas fa-heart"></i>';
  favoriteButton.addEventListener('click', () => {
    toggleFavorite(image);
  });

  imageCard.appendChild(imageElement);
  imageCard.appendChild(favoriteButton);

  imageCard.addEventListener('click', () => {
    showModal(image);
  });

  return imageCard;
}

function toggleFavorite(image) {
  const index = favorites.findIndex(favorite => favorite.id === image.id);
  if (index !== -1) {
    removeFromFavorites(image);
  } else {
    addToFavorites(image);
  }
}

function addToFavorites(image) {
  favorites.push(image);
  updateFavoritesUI();
}

function removeFromFavorites(image) {
  const index = favorites.findIndex(favorite => favorite.id === image.id);
  if (index !== -1) {
    favorites.splice(index, 1);
    updateFavoritesUI();
  }
}

function updateFavoritesUI() {
  const favoriteButtons = document.querySelectorAll('.image-card .favorite-button');

  favoriteButtons.forEach(button => {
    const imageId = button.parentNode.querySelector('img').alt;
    const index = favorites.findIndex(favorite => favorite.id === imageId);

    if (index !== -1) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  updateFavoritesGallery();
}

function updateFavoritesGallery() {
  favoritesContainer.innerHTML = '';

  favorites.forEach(image => {
    const favoriteImage = document.createElement('img');
    favoriteImage.src = image.largeImageURL;
    favoriteImage.alt = image.id;

    favoritesContainer.appendChild(favoriteImage);
  });

  if (favoritesContainer.classList.contains('show-favorites')) {
    displayFavoriteImages(favorites);
  }
}

// Define the displayFavoriteImages function
function displayFavoriteImages(favorites) {
  favoritesContainer.innerHTML = '';

  favorites.forEach(image => {
    const favoriteImage = document.createElement('img');
    favoriteImage.src = image.largeImageURL;
    favoriteImage.alt = image.id;

    favoritesContainer.appendChild(favoriteImage);
  });
}

favoritesButton.addEventListener('click', toggleFavoritesGallery);

function toggleFavoritesGallery() {
  favoritesContainer.innerHTML = '';

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = '<p>No favorites selected</p>';
  } else {
    displayFavoriteImages(favorites);
  }

  favoritesContainer.classList.toggle('show-favorites');
}

function showModal(image) {
  modal.style.display = 'block';
  modalContent.innerHTML = `
    <img src="${image.largeImageURL}" alt="${image.tags}" class="modal-image">
    <p class="modal-tags">${image.tags}</p>
    <p class="modal-likes"><i class="fas fa-thumbs-up"></i> ${image.likes}</p>
    <p class="modal-views"><i class="fas fa-eye"></i> ${image.views}</p>
  `;
}

closeModalButton.addEventListener('click', closeModal);

function closeModal() {
  modal.style.display = 'none';
}

modal.addEventListener('click', event => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Load images based on the initial search term or display a default set of images
  performSearch();
});
