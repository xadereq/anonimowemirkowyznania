$('.actionButton').click(function(){
  switch ($(this).data("action")) {
    case 'add':
      var endpoint = `/api/${$(this).data("endpoint")}/accept/${$(this).data("id")}`;
      $.ajax({
          type: "GET",
          url: endpoint
      })
      .done(function( response ) {
        console.log(response);
        alert(response.response.message);
      });
      break;
    case 'danger':
      var endpoint = `/api/${$(this).data("endpoint")}/danger/${$(this).data("id")}`;
      $.ajax({
          type: "GET",
          url: endpoint
      })
      .done(function( response ) {
        console.log(response);
        alert(response.response.message);
      });
      break;
    default:
    alert('unknown action');
  }
});
