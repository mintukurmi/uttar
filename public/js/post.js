
const optionsElem = document.querySelector('#choices-multiple-remove-button')
const postForm = document.querySelector('#new_post')
const submit_btn = document.querySelector('#post-submit');
const comment_box = document.querySelector('#comment_box');


const newPost = {
 
}

postForm.addEventListener('submit', (e)=> {
  e.preventDefault();
  // getting selected categories
  const checked = document.querySelectorAll('#categories :checked');
  let selectedCategories = [...checked].map(option =>  option.value);

  const newPost = { }
  newPost.title = postForm.title.value;
  newPost.description = postForm.description.value;
  newPost.categories = selectedCategories;
 
  postCreate('/posts/create', newPost)
  .then(data => {
    console.log(data); // JSON data parsed by `data.json()` call
    swal('Your post was successfully created!', 'Redirecting you to post in 3 sec..', 'success');
    postForm.title.value = postForm.description.value = '';
    
    $('#exampleModal').modal('hide');
    
    setTimeout(() => {
        window.location.href = "/posts/"+data._id+"#post";
    }, 2000)
  });

  submit_btn.innerHTML = 'Posting...'
  submit_btn.setAttribute('disabled', 'disabled');

})



// Posts create
async function postCreate(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
  

  document
  .querySelectorAll('[data-tiny-editor]')
  .forEach(editor =>
    editor.addEventListener('input', (e) => {
      comment_box.innerHTML = e.target.innerHTML;

    }
  )
);