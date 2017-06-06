/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize, progress */
'use strict';

const $btn = $('#searchBtn');
let list = [];
let lastSearch = '';
let timer;

//Populate page with search results (called from search function)
function displaySearchResults(data) {
   list = JSON.parse(data);

   //Clear previous search results and timer
   $('#results').empty();
   clearTimeout(timer);
   //Display the results
   list.forEach((e, i) => {
      //Set book owner for potential add to collection
      e.owner = localStorage.getItem('rv-bookclub-id');
      //Display results with staggered animation
      setTimeout(() => {
         $('#results').append(`
              <div class="col s12 m8 offset-m2 l6 offset-l3 animated fadeIn result" id="${e.id}">
                <h5>${e.title}</h5>
                <h6 class="authors"><i class="fa fa-caret-right"></i>&nbsp;${e.authors}</h6>
                <div class="card horizontal short">
                  <div class="card-image">
                    <img src="${e.thumbnail}" alt="${e.title}">
                  </div>
                  <div class="card-stacked">
                    <div class="card-content">
                      <p>${e.description}</p>
                      <a class="btn-floating halfway-fab waves-effect waves-light blue" id="${e.id}" data-i="${i}" data-title="${e.title}" onclick="addBook(this, true)">
                        <i class="material-icons tooltipped" data-tooltip="Add ${e.title} to your collection">add</i>
                      </a>
                    </div>
                    <div class="card-action">
                      <a class="bookLink blue-text" href="${e.link}" target="_blank">More Info</a>
                    </div>
                  </div>
                </div>
              </div>
         `);
      }, i * 80);
   });

   //After all results are displayed, complete UI updates
      setTimeout(() => {
         $('.tooltipped').tooltip();
         progress('hide');
         $btn.removeClass('disabled');
         $btn.html('Search');
      }, list.length * 100);
}

//Search for results via GET request
function search(book) {
   //First, ensure search field is populated
   if (!book.trim()) 
      return Materialize.toast('Please enter a book title', 3000, 'error');
   //Then, ensure user entered a new location (to prevent duplicate requests)
   if (book.trim().toLowerCase() === lastSearch) 
      return Materialize.toast('Please enter a new book title', 3000, 'error');
   
   //Update the UI and perform the search
   $('.card-div').addClass('fadeOut');
   progress('show');
   $btn.addClass('disabled');
   $btn.html('<i class="fa fa-spinner fa-spin fa-fw"></i>');
   ajaxFunctions.ajaxRequest('GET', `/api/search/${book}`, displaySearchResults);
   lastSearch = book.trim().toLowerCase();
  
  //7-second timer to prevent search hang-up
   timer = setTimeout(() => {
         Materialize.toast('Search took too long. Please try again.', 3000, 'error');
         lastSearch = '';
         $('#bookInput').val('');
         progress('hide');
         $btn.removeClass('disabled');
         $btn.html('Search');
   }, 7000);
}

//Handle 'Add Book' link click
function addBook(link) {
   progress('show');
   $(link).addClass('disabled');
   //Update the database (add book to the user's collection)
   let apiUrl = `/api/book/${link.getAttribute('id')}/${localStorage.getItem('rv-bookclub-id')}`;
   ajaxFunctions.ajaxRequest('PUT', apiUrl, (data) => {
      //After adding book ID to user's collection, add book data to the club's collection
      $.post(apiUrl, list[$(link).data('i')])
			.done((res) => {
			   //Notify user of the result
			   if (res === 'exists') Materialize.toast(`${$(link).data('title')} is already in your collection!`, 5000);
            else Materialize.toast(`Added ${res.title} to your collection!`, 5000);
            //Update UI
            $(link).html(`<i class="material-icons">thumb_up</i>`);
            progress('hide');
			})
			.fail(() => {
            console.error('Could not load data');
			});
   });
}

//Handle search button click
$btn.click(() => search($('#bookInput').val()));

//Handle enter-key submission from search field
$('#bookForm').on('submit', e => {
   e.preventDefault();
   search($('#bookInput').val());
});
