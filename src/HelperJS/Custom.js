var menujq = $.noConflict();
function redirecttoSPSearch()
    {
        if (document.getElementById('SearchBoxtxt').value != "")
        {
            window.location = '@(Model.SharepointSearchUrl)' + document.getElementById('SearchBoxtxt').value;
            return false;
        }
        else
        {
            alert("Please enter one or more search words.");
        }
}
function checkenter(event, i) {
    if (event.keyCode == 13) {
        event.preventDefault();
        redirecttoSPSearch();
        return false;
    }
}
function HasOnlyOneDealer() {
    //debugger;
        var flag = '@Model.OneDealer';
        if (flag == "True") {
            //$('#mydealership').addClass('mydealership-disabled');
            menujq('#mydealershipdropdown').addClass('mydealership-hidden');
        }
}
function HideDealerShip() {
    if ('@Model.CallerName' != 'Sharepoint' && '@Model.CallerName' != 'DealerPortal')
    {
       menujq('#mydealershipdropdown').addClass('mydealership-hidden');
    }
}

//JS functions Detect Dealer Context change in another tab
function CheckDealerContextChange() {
    //console.log("inside CheckDealerContextChange function");
    var newdealerNo = accessCookieDealerNo();
    var oldDealerNo = menujq("#menu-context").attr("data-set-dealer");
   // console.log('OldDealer =' + oldDealerNo + '\nNewDealer=' + newdealerNo);

    // Vendors like Alloy dont have cookies. So no check performed if cookie is not found.
    if (oldDealerNo == null || newdealerNo == null) { return; }

    // Show alert message if dealer context changed
    if (oldDealerNo != newdealerNo) {
       // console.log('OldDealer =' + oldDealerNo + '\nNewDealer=' + newdealerNo);
        toggleModal();
        CountdownTimer();
    }
    else {

    }
}
// JS Library to read cookie
function accessCookieDealerNo() {
    var cookie = Cookies.get("DealerContext");
    if (cookie == null) { return null; }
    else {
        var data = JSON.parse(cookie);
        return data.SETNumber;
    }
}
var myCounter;
// Counter to show the popup modal window message for dealer context change.
function CountdownTimer() {
    myCounter = new Countdown({
        seconds: 10,  // number of seconds to count down
        onUpdateStatus: function (sec) { console.log(sec); document.getElementById('timer').innerHTML = sec + ' secs';}, // callback for each second
        onCounterEnd: function () { console.log('counter ended!'); refreshWindow()} // final action
    });
    myCounter.start();
}

function Countdown(options) {
    var timer,
        instance = this,
        seconds = options.seconds || 10,
        updateStatus = options.onUpdateStatus || function () { },
        counterEnd = options.onCounterEnd || function () { };

    function decrementCounter() {
        updateStatus(seconds);
        if (seconds === 0) {
            counterEnd();
            instance.stop();
        }
        seconds--;
    }

    this.start = function () {
        clearInterval(timer);
        timer = 0;
        seconds = options.seconds;
        timer = setInterval(decrementCounter, 1000);
    };

    this.stop = function () {
        clearInterval(timer);
    };
}
// Refresh the page if dealer context is changed in another tab
function refreshWindow() {
    window.location.reload(true);
}
// Modal window to show dealer context change message
function toggleModal() {
    //console.log("inside togglemodal");
    var modal = document.querySelector(".modal-dealer-context");
    if (modal.classList.contains("hide-modal-dealer-context")) {
        modal.classList.replace("hide-modal-dealer-context","show-modal-dealer-context");
    }
    else {
        modal.classList.add("show-modal-dealer-context");
    }
}
function ReloadThePage() {
    //console.log('In the function to Reload the Page immediately');
    myCounter.stop();
    refreshWindow();
}
function StopReloadingThePage() {
    //console.log('In the function to Stop Reloading the Page');
    myCounter.stop();
    var modal = document.querySelector(".modal-dealer-context");
    modal.classList.replace("show-modal-dealer-context", "hide-modal-dealer-context");
}
// End of JS functions to detect Dealer Context change
/*
menujq(document).ready(function () {
    
        HasOnlyOneDealer();
        HideDealerShip();

    menujq("#myInput").on("keyup", function () {
        var value = menujq(this).val().toLowerCase();
        menujq("#mydealershiplist li").filter(function () {
            menujq(this).toggle(menujq(this).text().toLowerCase().indexOf(value) > -1);
        });
        var input = menujq("#myInput").val();
        if (input != "") {
            menujq('#mydealershiplistdiv').removeClass('mydealership-hidden').addClass('mydealership-shown');
            if (menujq('.mydealer').length - menujq('.mydealer[style="display: none;"]').length > 0) {
                menujq('#noresultsdiv').removeClass('noresults-shown').addClass('noresults-hidden');
            }
            else {
                menujq('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
                menujq('#noresultsdiv').removeClass('noresults-hidden').addClass('noresults-shown');
            }
        }
        else {
            //menujq('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
            menujq('#noresultsdiv').removeClass('noresults-shown').addClass('noresults-hidden');
        }
    });
    menujq("#mylinksinput").on("keyup", function () {
        var value = menujq(this).val().toLowerCase();
        menujq("#mylinks-container li").filter(function () {
            menujq(this).toggle(menujq(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    menujq(".dropdown-menu").css('margin-top', 0);
    //menujq("#mydealershipdropdown")
    //    .mouseover(function () {
    //        menujq(this).addClass('show').attr('aria-expanded', "true");
    //        menujq(this).find('.dropdown-menu').addClass('show');
    //        menujq('#myInput').focus();
    //        //$('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
    //    })
    //    .mouseleave(function () {
    //        menujq(this).removeClass('show').attr('aria-expanded', "false");
    //        menujq(this).find('.dropdown-menu').removeClass('show');
    //        menujq('#myInput').val('');
    //        menujq('#myInput').trigger("keyup");
    //        //menujq('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
    //        menujq('#noresultsdiv').removeClass('noresults-shown').addClass('noresults-hidden');
    //    });
    menujq("#DealershipnavbarDropdown").click(function () {
        //menujq('#myInput').focus();
        menujq('#myInput').val('');
        menujq('#myInput').trigger("keyup");  
        menujq('#mydealershiplist').animate({ scrollTop: 0 }, "0.01", function () {
            menujq('#myInput').focus();
        });
                                     
    });  
    menujq(document).mouseup(function (e) {
        //debugger;

        if (e.target.id == "DealershipnavbarDropdown") {                    
            if (menujq('#mydealershipdropdown-menu').hasClass('show')) {                        
                menujq('#mydealershipdropdown-menu').addClass('hide');
                menujq('#mydealershipdropdown-menu').removeClass('show');
            }
            else {                        
                menujq('#mydealershipdropdown-menu').addClass('show');
                menujq('#mydealershipdropdown-menu').removeClass('hide');
            }
        }
        if (e.target.id != "DealershipnavbarDropdown") {                    
            if (menujq('#mydealershipdropdown-menu').hasClass('show')) {                        
                menujq('#mydealershipdropdown-menu').addClass('hide');
                menujq('#mydealershipdropdown-menu').removeClass('show');
            }
        }

        if (e.target.id == "LinknavbarDropdown") {                    
            if (menujq('#mylinks-container').hasClass('show')) {                        
                menujq('#mylinks-container').addClass('hide');
                menujq('#mylinks-container').removeClass('show');
            }
            else {                        
                menujq('#mylinks-container').addClass('show');
                menujq('#mylinks-container').removeClass('hide');
            }
        }
        if (e.target.id != "LinknavbarDropdown") {
            console.log('outside d');
            console.log('You clicked on ' + e.target.innerHTML);
            if (menujq('#mylinks-container').hasClass('show')) {                        
                menujq('#mylinks-container').addClass('hide');
                menujq('#mylinks-container').removeClass('show');
            }
        }
    });
    //menujq("#mylinksdropdown")
    //    .mouseover(function () {
    //        menujq(this).addClass('show').attr('aria-expanded', "true");
    //        menujq(this).find('.dropdown-menu').addClass('show');
    //        menujq('#mylinksinput').focus();
    //    })
    //    .mouseleave(function () {
    //        menujq(this).removeClass('show').attr('aria-expanded', "false");
    //        menujq(this).find('.dropdown-menu').removeClass('show');
    //        menujq('#mylinksinput').val('');
    //        menujq('#mylinksinput').trigger("keyup");
    //    });
        menujq("#LinknavbarDropdown").click(function () {
            menujq('#mylinksinput').val('');
            menujq('#mylinksinput').trigger("keyup");
            menujq('#mylinks-container').animate({ scrollTop: 0 }, "0.01", function () {                                               
                menujq('#mylinksinput').focus();
            });                    
        });
    menujq("#relatedreportsdropdown")
        .mouseover(function () {
            menujq(this).addClass('show').attr('aria-expanded', "true");
            menujq(this).find('.dropdown-menu').addClass('show');
        })
        .mouseleave(function () {
            menujq(this).removeClass('show').attr('aria-expanded', "false");
            menujq(this).find('.dropdown-menu').removeClass('show');
        });
    menujq('.mydealer').on("click", function () {
        //alert(this.textContent);
       // debugger;
       var positionofcolon = this.textContent.indexOf(':');
        var dealerEirId = '@Model.Dealer.DealerEirId';
        var dealerName = this.textContent.substring(positionofcolon+1);
        var setNumber = this.textContent.substring(0,positionofcolon);
       //console.log("About to call doPostBack for: " + this.textContent);
            __doPostBack('DealerContextChanged', setNumber);
        menujq('#mydealershiplist').toggle();
       
    });

    // Bind on-focus event to check for dealer context change
    menujq(window).bind("focus", CheckDealerContextChange);

    // Toggle menu-header on click of expand/collapse image
        menujq("#liexpandcollapse").click(function () {
            menujq("#menu-header").slideToggle("slow");
        });
});
*/
//function myInputOnKeyDown(event, i) {
//    if (event.keyCode == 40) {
//        //Move focus to first item in Dealer list 
//        $('#mydealershiplist').find("li:first").focus().addClass("active");
//    }
//}
//function DealerlistKeyDown(event, i) {
//    if (event.keyCode == 40) {
//        //Move focus to next item in Dealer list 
//        console.log($('li.actve').next());
//        $('li.actve').next().focus().addClass("active");
//    }
//}

function WireUpMenu() {
    
    HasOnlyOneDealer();
    //HideDealerShip();

menujq("#myInput").on("keyup", function () {
    var value = menujq(this).val().toLowerCase();
    menujq("#mydealershiplist li").filter(function () {
        menujq(this).toggle(menujq(this).text().toLowerCase().indexOf(value) > -1);
    });
    var input = menujq("#myInput").val();
    if (input != "") {
        menujq('#mydealershiplistdiv').removeClass('mydealership-hidden').addClass('mydealership-shown');
        if (menujq('.mydealer').length - menujq('.mydealer[style="display: none;"]').length > 0) {
            menujq('#noresultsdiv').removeClass('noresults-shown').addClass('noresults-hidden');
        }
        else {
            menujq('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
            menujq('#noresultsdiv').removeClass('noresults-hidden').addClass('noresults-shown');
        }
    }
    else {
        //menujq('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
        menujq('#noresultsdiv').removeClass('noresults-shown').addClass('noresults-hidden');
    }
});
menujq("#mylinksinput").on("keyup", function () {
    var value = menujq(this).val().toLowerCase();
    menujq("#mylinks-container li").filter(function () {
        menujq(this).toggle(menujq(this).text().toLowerCase().indexOf(value) > -1)
    });
});
menujq(".dropdown-menu").css('margin-top', 0);
//menujq("#mydealershipdropdown")
//    .mouseover(function () {
//        menujq(this).addClass('show').attr('aria-expanded', "true");
//        menujq(this).find('.dropdown-menu').addClass('show');
//        menujq('#myInput').focus();
//        //$('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
//    })
//    .mouseleave(function () {
//        menujq(this).removeClass('show').attr('aria-expanded', "false");
//        menujq(this).find('.dropdown-menu').removeClass('show');
//        menujq('#myInput').val('');
//        menujq('#myInput').trigger("keyup");
//        //menujq('#mydealershiplistdiv').removeClass('mydealership-shown').addClass('mydealership-hidden');
//        menujq('#noresultsdiv').removeClass('noresults-shown').addClass('noresults-hidden');
//    });
menujq("#DealershipnavbarDropdown").click(function () {
    //menujq('#myInput').focus();
    menujq('#myInput').val('');
    menujq('#myInput').trigger("keyup");  
    menujq('#mydealershiplist').animate({ scrollTop: 0 }, "0.01", function () {
        menujq('#myInput').focus();
    });
                                 
});  
menujq(document).mouseup(function (e) {
    //debugger;

    if (e.target.id == "DealershipnavbarDropdown") {                    
        if (menujq('#mydealershipdropdown-menu').hasClass('show')) {                        
            menujq('#mydealershipdropdown-menu').addClass('hide');
            menujq('#mydealershipdropdown-menu').removeClass('show');
        }
        else {                        
            menujq('#mydealershipdropdown-menu').addClass('show');
            menujq('#mydealershipdropdown-menu').removeClass('hide');
        }
    }
    if (e.target.id != "DealershipnavbarDropdown") {                    
        if (menujq('#mydealershipdropdown-menu').hasClass('show')) {                        
            menujq('#mydealershipdropdown-menu').addClass('hide');
            menujq('#mydealershipdropdown-menu').removeClass('show');
        }
    }

    if (e.target.id == "LinknavbarDropdown") {                    
        if (menujq('#mylinks-container').hasClass('show')) {                        
            menujq('#mylinks-container').addClass('hide');
            menujq('#mylinks-container').removeClass('show');
        }
        else {                        
            menujq('#mylinks-container').addClass('show');
            menujq('#mylinks-container').removeClass('hide');
        }
    }
    if (e.target.id != "LinknavbarDropdown") {
        console.log('outside d');
        console.log('You clicked on ' + e.target.innerHTML);
        if (menujq('#mylinks-container').hasClass('show')) {                        
            menujq('#mylinks-container').addClass('hide');
            menujq('#mylinks-container').removeClass('show');
        }
    }
});
//menujq("#mylinksdropdown")
//    .mouseover(function () {
//        menujq(this).addClass('show').attr('aria-expanded', "true");
//        menujq(this).find('.dropdown-menu').addClass('show');
//        menujq('#mylinksinput').focus();
//    })
//    .mouseleave(function () {
//        menujq(this).removeClass('show').attr('aria-expanded', "false");
//        menujq(this).find('.dropdown-menu').removeClass('show');
//        menujq('#mylinksinput').val('');
//        menujq('#mylinksinput').trigger("keyup");
//    });
    menujq("#LinknavbarDropdown").click(function () {
        menujq('#mylinksinput').val('');
        menujq('#mylinksinput').trigger("keyup");
        menujq('#mylinks-container').animate({ scrollTop: 0 }, "0.01", function () {                                               
            menujq('#mylinksinput').focus();
        });                    
    });
menujq("#relatedreportsdropdown")
    .mouseover(function () {
        menujq(this).addClass('show').attr('aria-expanded', "true");
        menujq(this).find('.dropdown-menu').addClass('show');
    })
    .mouseleave(function () {
        menujq(this).removeClass('show').attr('aria-expanded', "false");
        menujq(this).find('.dropdown-menu').removeClass('show');
    });
menujq('.mydealer').on("click", function () {
    //alert(this.textContent);
   // debugger;
   var positionofcolon = this.textContent.indexOf(':');
    var dealerEirId = '@Model.Dealer.DealerEirId';
    var dealerName = this.textContent.substring(positionofcolon+1);
    var setNumber = this.textContent.substring(0,positionofcolon);
   //console.log("About to call doPostBack for: " + this.textContent);
        //__doPostBack('DealerContextChanged', setNumber);
        ChangeDealership(setNumber);   
});

function ChangeDealership(setNumber)
{
    //__doPostBack('DealerContextChanged', setNumber);
    alert(setNumber + " : Changing dealership - Coming Soon!")
    //menujq('#mydealershiplist').toggle();
}
// Bind on-focus event to check for dealer context change
menujq(window).bind("focus", CheckDealerContextChange);

// Toggle menu-header on click of expand/collapse image
    menujq("#liexpandcollapse").click(function () {
        menujq("#menu-header").slideToggle("slow");
    });
}


window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
    'userId': '@HttpUtility.JavaScriptStringEncode(Model.User.UserCode)',
    'set_dealer_number': '@HttpUtility.JavaScriptStringEncode(Model.Dealer.DealerCode)',
    'app_name': '@HttpUtility.JavaScriptStringEncode(Model.AppName_GoogleTagManager)'
});

(function (w, d, s, l, i) {
w[l] = w[l] || []; w[l].push({
    'gtm.start':
            new Date().getTime(), event: 'gtm.js'
    });
    var f = d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window, document, 'script', 'dataLayer', '@HttpUtility.JavaScriptStringEncode(Model.GoogleTagManagerId)');


/*
(function(){
    alert("My auto function was called here");
    return false;
   })();
   */
function SayHello(msg)
{
    alert(msg);
}