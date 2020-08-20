function SayHello(msg)
{
    alert(msg);
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
 

function MyCheckDealerContextChange() {
    var newdealerNo = getCookie('setNumber');
    var oldDealerNo = menujq("#menu-context").attr("data-set-dealer");

    // Vendors like Alloy dont have cookies. So no check performed if cookie is not found.
    if (oldDealerNo == null || newdealerNo == null) { return; }

    // Show alert message if dealer context changed
    if (oldDealerNo != newdealerNo) {
        toggleModal();
        CountdownTimer();
    }
    else {

    }
}
function MyCookieFunction()
{
    $(window).bind("focus", MyCheckDealerContextChange);
}