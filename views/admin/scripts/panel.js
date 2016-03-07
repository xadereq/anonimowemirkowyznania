$('.accept').click(function(){
  switch ($(this).data("action")) {
    case 'add':
      var endpoint = `/api/${$(this).data("endpoint")}/accept/${$(this).data("id")}`;
      var authorizationHeader = "Basic "+btoa($('#auth').val());
      console.log(authorizationHeader);
      $.ajax({
          type: "GET",
          url: endpoint,
          headers: {authorization: authorizationHeader}
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
