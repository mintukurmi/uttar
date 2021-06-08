// multi select handler
$(document).ready(function(){

  var multipleCancelButton = new Choices('#categories', {
  removeItemButton: true,
  maxItemCount:3,
  searchResultLimit:10,
  renderChoiceLimit:5,
  searchEnabled: true,
  searchChoices: true,
  searchFloor: 1,
  searchResultLimit: 4,
  searchFields: ['label'],
  position: 'auto',
  resetScrollPosition: true,
  });
  
  
  });


  // password hide/ unhide toggler
function passToggler(e){

    console.log(e)
    e.querySelector('i').classList.forEach( item => {
    console.log(item)
      if(item === 'fa-eye'){
          e.querySelector('input').type = 'password';
          e.querySelector('i').classList.add('fa-eye-slash')
          e.querySelector('i').classList.add('fa-eye-slash');
      }
      if(item === 'fa-eye-slash'){
        e.querySelector('input').type = 'text';
        e.querySelector('i').classList.remove('fa-eye-slash')
        e.querySelector('i').classList.add('fa-eye')
      }
  })
}
