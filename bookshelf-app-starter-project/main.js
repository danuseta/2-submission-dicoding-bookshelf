const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-books';
const SEARCH_EVENT = 'search-books';
let books = [];

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');

    const checkBox = document.getElementById('bookFormIsComplete');
    const submitButton = document.getElementById('bookFormSubmit');
    checkBox.addEventListener('change', function () {
        const buttonSpan = submitButton.querySelector('span');
        if (this.checked) {
            buttonSpan.textContent = 'Selesai dibaca';
        } else {
            buttonSpan.textContent = 'Belum selesai dibaca';
        }
    });

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.dispatchEvent(new Event(SEARCH_EVENT));
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }


});

function addBook() {
    const titleInput = document.getElementById('bookFormTitle');
    const authorInput = document.getElementById('bookFormAuthor');
    const yearInput = document.getElementById('bookFormYear');
    const isCompleteInput = document.getElementById('bookFormIsComplete');

    const id = +new Date();
    const title = titleInput.value;
    const author = authorInput.value;
    const year = parseInt(yearInput.value);
    const isComplete = isCompleteInput.checked;

    const bookObject = {
        id,
        title,
        author,
        year,
        isComplete
    };

    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    titleInput.value = '';
    authorInput.value = '';
    yearInput.value = '';
    isCompleteInput.checked = false;

    const submitButton = document.getElementById('bookFormSubmit');
    const buttonSpan = submitButton.querySelector('span');
    buttonSpan.textContent = 'Belum selesai dibaca';
}

function makeBookElement(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    const container = document.createElement('div');
    container.setAttribute('data-bookid', id);
    container.setAttribute('data-testid', 'bookItem');

    const titleElement = document.createElement('h3');
    titleElement.setAttribute('data-testid', 'bookItemTitle');
    titleElement.innerText = title;

    const authorElement = document.createElement('p');
    authorElement.setAttribute('data-testid', 'bookItemAuthor');
    authorElement.innerText = `Penulis: ${author}`;

    const yearElement = document.createElement('p');
    yearElement.setAttribute('data-testid', 'bookItemYear');
    yearElement.innerText = `Tahun: ${year}`;

    const actionContainer = document.createElement('div');

    const toggleButton = document.createElement('button');
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    toggleButton.addEventListener('click', function () {
        toggleBookStatus(id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function () {
        deleteBook(id);
    });

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.addEventListener('click', function () {
        editBook(id);
    });

    actionContainer.append(toggleButton, deleteButton, editButton);
    container.append(titleElement, authorElement, yearElement, actionContainer);

    return container;
}

function toggleBookStatus(bookId) {
    const bookTarget = books.find(book => book.id === bookId);
    if (bookTarget) {
        bookTarget.isComplete = !bookTarget.isComplete;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function deleteBook(bookId) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function editBook(bookId) {
    const bookTarget = books.find(book => book.id === bookId);
    if (bookTarget) {
        document.getElementById('bookFormTitle').value = bookTarget.title;
        document.getElementById('bookFormAuthor').value = bookTarget.author;
        document.getElementById('bookFormYear').value = bookTarget.year;
        document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

        deleteBook(bookId);
    }

    const submitButton = document.getElementById('bookFormSubmit');
    const buttonSpan = submitButton.querySelector('span');
    buttonSpan.textContent = bookTarget.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
}

function searchBooks() {
    const searchInput = document.getElementById('searchBookTitle');
    const query = searchInput.value.toLowerCase();

    const filteredBooks = query
        ? books.filter(book => book.title.toLowerCase().includes(query))
        : books;

    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const book of filteredBooks) {
        const bookElement = makeBookElement(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
}

document.addEventListener(RENDER_EVENT, function () {
    searchBooks();
});

document.addEventListener(SEARCH_EVENT, function () {
    searchBooks();
});

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        books = data;
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}