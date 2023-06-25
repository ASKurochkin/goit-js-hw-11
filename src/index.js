import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '37750848-4585d650f16eea92bce73625f';
const IMG_IN_PAGE = 40;

let counterPage = 1;
let totalHits = 0;

async function fetchImages(searchQuery, page) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: IMG_IN_PAGE,
        page: page,
      },
    });

    const result = response.data;
    totalHits = result.totalHits;
    if (totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    return result.hits;
  } catch (error) {
    console.log(error.message);
  }
}

async function fetchSearch(event) {
  event.preventDefault();
  const searchQuery = event.target.searchQuery.value;
  counterPage = 1;

  try {
    const images = await fetchImages(searchQuery, counterPage);
    renderGal(images);
    loadNextPage(images.length === IMG_IN_PAGE);
  } catch {
    Notiflix.Notify.failure('Failed to fetch images. Please try again.');
  }
}

function renderGal(images) {
  if (counterPage === 1) {
    galleryEl.innerHTML = '';
  }

  const galleryMarkup = images
    .map(image => {
      return `
        <div class="photo-card">
        <a class="gallery__link" href="${image.largeImageURL}">
        <img class="content-img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
          <div class="info">
            <p class="info-item">
              <b>Likes:</b> ${image.likes}
            </p>
            <p class="info-item">
              <b>Views:</b> ${image.views}
            </p>
            <p class="info-item">
              <b>Comments:</b> ${image.comments}
            </p>
            <p class="info-item">
              <b>Downloads:</b> ${image.downloads}
            </p>
          </div>
        </div>
      `;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', galleryMarkup);
}

function loadNextPage(show) {
  loadBtn.style.display = show ? 'block' : 'none';
}

async function loadMore() {
  counterPage++;
  const searchQuery = searchFormEl.searchQuery.value;

  try {
    const images = await fetchImages(searchQuery, counterPage);
    renderGal(images);
    loadNextPage(images.length === IMG_IN_PAGE);

    if (counterPage * IMG_IN_PAGE >= totalHits) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch {
    Notiflix.Notify.failure('Failed to fetch more images. Please try again.');
  }
}

function onClick (event) {
  event.preventDefault();

    const lightbox = new SimpleLightbox(".gallery a");

    galleryEl.removeEventListener("click", onClick)  
};

searchFormEl.addEventListener('submit', fetchSearch);
galleryEl.addEventListener('click', onClick)
loadBtn.addEventListener('click', loadMore);
